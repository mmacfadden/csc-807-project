import * as CryptoJS from "crypto-js";
import {sample_hgd, sample_uniform} from "./stat";
import {ValueRange} from "./ValueRange";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

const DEFAULT_IN_RANGE_START = 0;
const DEFAULT_IN_RANGE_END = 2 ** 15 - 1;
const DEFAULT_OUT_RANGE_START = 0;
const DEFAULT_OUT_RANGE_END = 2 ** 31 - 1;

export class OPE {

  /**
   * """Generate random key for ope cipher.
   * Parameters
   *         // ----------
   *         //     block_size : int, optional
   *         // Length of random bytes.
   *         //     Returns
   *         // -------
   *         //     random_key : str
   *         // A random key for encryption.
   *         //                      Notes:
   *         // ------
   *         //     Implementation follows https://github.com/pyca/cryptography
   *         //     """
   * @param block_size
   */
  public static generate_key(block_size: number): Uint8Array {
    if (!block_size || block_size < 24) {
      throw new Error("block_size must be >= 24: " + block_size)
    }

    const random_seq = CryptoJS.lib.WordArray.random(block_size)
    const random_key = CryptoJS.enc.Base64.stringify(random_seq);
    return new TextEncoder().encode(random_key);
  }

  public readonly key: CryptoJS.lib.WordArray;
  private readonly out_range: ValueRange;
  private readonly in_range: ValueRange;
  private readonly _zeros: CryptoJS.lib.WordArray;

  constructor(key: Uint8Array, inRange?: ValueRange, outRange?: ValueRange) {
    this.key = CryptoJsUtils.convertUint8ArrayToWordArray(key);

    // # Use AES in the CTR mode to generate a pseudo-random bit string
    this._zeros = CryptoJS.lib.WordArray.create([0, 0, 0, 0]);

    if (!inRange) {
      inRange = new ValueRange(DEFAULT_IN_RANGE_START, DEFAULT_IN_RANGE_END);
    }
    this.in_range = inRange;

    if (!outRange) {
      outRange = new ValueRange(DEFAULT_OUT_RANGE_START, DEFAULT_OUT_RANGE_END);
    }

    this.out_range = outRange;

    if (this.in_range.size() > this.out_range.size()) {
      throw new Error('Invalid range')
    }
  }

  /**
   * Encrypt the given plaintext value
   * @param plaintext
   */
  public encrypt(plaintext: number): number {
    if (!this.in_range.contains(plaintext)) {
      throw new Error('Plaintext is not within the input range')
    }

    return this.encrypt_recursive(plaintext, this.in_range, this.out_range);
  }

  public encrypt_recursive(plaintext: number, in_range: ValueRange, out_range: ValueRange): number {
    const in_size = in_range.size()       // M
    const out_size = out_range.size()    // N
    const in_edge = in_range.start - 1    // d
    const out_edge = out_range.start - 1  // r
    const mid = out_edge + Math.round(Math.ceil(out_size / 2.0))  // y

    //assert(in_size <= out_size);

    if (in_range.size() == 1) {
      const coins = this.tape_gen(plaintext);
      const ciphertext = sample_uniform(out_range, coins);
      return ciphertext;
    }

    const coins = this.tape_gen(mid);

    const x = sample_hgd(in_range, out_range, mid, coins)

    if (plaintext <= x) {
      in_range = new ValueRange(in_edge + 1, x)
      out_range = new ValueRange(out_edge + 1, mid)
    } else {
      in_range = new ValueRange(x + 1, in_edge + in_size)
      out_range = new ValueRange(mid + 1, out_edge + out_size)
    }

    return this.encrypt_recursive(plaintext, in_range, out_range)
  }

  /**
   * Decrypt the given ciphertext value
   * @param ciphertext
   */
  public decrypt(ciphertext: number) {
    if (!this.out_range.contains(ciphertext)) {
      throw new Error('Ciphertext is not within the output range')
    }

    return this.decrypt_recursive(ciphertext, this.in_range, this.out_range);
  }

  public decrypt_recursive(ciphertext: number, in_range: ValueRange, out_range: ValueRange): number {
    const in_size = in_range.size();                                    // M
    const out_size = out_range.size();                                  // N
    const in_edge = in_range.start - 1;                                 // d
    const out_edge = out_range.start - 1;                               // r
    const mid = out_edge + Math.round(Math.ceil(out_size / 2.0));    // y
    // assert(in_size <= out_size);

    if (in_range.size() == 1) {
      const in_range_min = in_range.start
      const coins = this.tape_gen(in_range_min)
      const sampled_ciphertext = sample_uniform(out_range, coins)
      if (sampled_ciphertext === ciphertext) {
        return in_range_min;
      } else {
        throw new Error('Invalid ciphertext');
      }
    }

    const coins = this.tape_gen(mid)
    const x = sample_hgd(in_range, out_range, mid, coins);

    if (ciphertext <= mid) {
      in_range = new ValueRange(in_edge + 1, x);
      out_range = new ValueRange(out_edge + 1, mid);
    } else {
      in_range = new ValueRange(x + 1, in_edge + in_size);
      out_range = new ValueRange(mid + 1, out_edge + out_size);
    }

    return this.decrypt_recursive(ciphertext, in_range, out_range);
  }

  /**
   * """Return a bit string, generated from the given data string"""
   * @param input
   */
  public tape_gen(input: number): Iterator<number> {
    const data = CryptoJS.enc.Utf8.parse(input.toString())

    // Derive a key from data
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, this.key);
    hmac.update(data);

    const digest = hmac.finalize();

    const aesEncryptor = CryptoJS.algo.AES.createEncryptor(digest, {
      mode: CryptoJS.mode.CTR,
      iv: this._zeros,
      padding: CryptoJS.pad.NoPadding
    });

    return new BitIterator(aesEncryptor, this._zeros);
  }
}

class BitIterator implements Iterator<number>{
  private _bits: number[];
  private _bitIndex = 0;
  private _aesEncryptor: any;
  private readonly _zeros: any;

  constructor(aesEncryptor: any, zeros: CryptoJS.lib.WordArray) {
    this._aesEncryptor = aesEncryptor;
    this._bits = [];
    this._zeros = zeros;
  }

  next(): IteratorResult<number> {
    if (this._bitIndex >= this._bits.length) {
      const encrypted_words = this._aesEncryptor.process(this._zeros);

      this._bits = [];
      for (let i = 0x0; i < encrypted_words.sigBytes; i++) {
        const byte = encrypted_words.words[i >>> 0x2] >>> 0x18 - i % 0x4 * 0x8 & 0xff;

        this._bits.push(byte >> 7 & 1);
        this._bits.push(byte >> 6 & 1);
        this._bits.push(byte >> 5 & 1);
        this._bits.push(byte >> 4 & 1);
        this._bits.push(byte >> 3 & 1);
        this._bits.push(byte >> 2 & 1);
        this._bits.push(byte >> 1 & 1);
        this._bits.push(byte >> 0 & 1);
      }

      this._bitIndex = 0;
    }

    return {
      done: false,
      value: this._bits[this._bitIndex++]
    };
  }
}
