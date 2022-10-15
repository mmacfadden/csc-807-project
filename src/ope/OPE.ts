import * as CryptoJS from "crypto-js";

import {str_to_bitstring} from "./util";
import {assert} from "./errors";
import {sample_hgd, sample_uniform} from "./stat";
import {ValueRange} from "./ValueRange";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

const DEFAULT_IN_RANGE_START = 0;
const DEFAULT_IN_RANGE_END = 2**15 - 1;
const DEFAULT_OUT_RANGE_START = 0;
const DEFAULT_OUT_RANGE_END = 2**31 - 1;

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
    public static generate_key(block_size: number = 32): Uint8Array {
        const random_seq = CryptoJS.lib.WordArray.random(block_size)
        const random_key = CryptoJS.enc.Base64.stringify(random_seq);
        return new TextEncoder().encode(random_key);
    }

    public readonly key: Uint8Array;
    private readonly out_range: ValueRange;
    private readonly in_range: ValueRange;

    constructor(key: Uint8Array, inRange?: ValueRange, outRange?: ValueRange) {
        if (!(key instanceof Uint8Array)) {
            throw new Error(`key: expected Uint8Array, but got: ${typeof(key)}`)
        }

        this.key = key;

        if (!inRange){
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
        if (typeof(plaintext) !== "number") {
            throw new Error('Plaintext must be an integer value');
        }

        if (!this.in_range.contains(plaintext)) {
            throw new Error('Plaintext is not within the input range')
        }

        return this.encrypt_recursive(plaintext, this.in_range, this.out_range);
    }

    public encrypt_recursive(plaintext:number, in_range:ValueRange, out_range: ValueRange): number {

        const in_size = in_range.size()       // M
        const out_size = out_range.size()    // N
        const in_edge = in_range.start - 1    // d
        const out_edge = out_range.start - 1  // r
        const mid = out_edge + Math.round(Math.ceil(out_size / 2.0))  // y

        assert( in_size <= out_size);

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
        }
        else {
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
        if (typeof(ciphertext) !== "number") {
            throw new Error('Ciphertext must be an integer value')
        }
        if  (!this.out_range.contains(ciphertext)) {
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
        assert(in_size <= out_size)
        if (in_range.size() == 1) {
            const in_range_min = in_range.start
            const coins = this.tape_gen(in_range_min)
            const sampled_ciphertext = sample_uniform(out_range, coins)
            if (sampled_ciphertext == ciphertext) {
                return in_range_min
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
    public* tape_gen(input: number): Generator<number> {
        const data = CryptoJS.enc.Utf8.parse(input.toString())

        // Derive a key from data
        const keyAsWordArray = CryptoJsUtils.convertUint8ArrayToWordArray(this.key);
        const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, keyAsWordArray);
        hmac.update(data);

        const digest = hmac.finalize();

        assert(digest.sigBytes == 32, "The hmac digest must be 32 bytes");

        // # Use AES in the CTR mode to generate a pseudo-random bit string
        const zeros = CryptoJS.lib.WordArray.create([0,0,0,0]);

        const aesEncryptor = CryptoJS.algo.AES.createEncryptor(digest, {
            mode: CryptoJS.mode.CTR,
            iv: zeros,
            padding: CryptoJS.pad.NoPadding
        });

        while (true)  {
            const encrypted_words = aesEncryptor.process(zeros);
            const encrypted_bytes = CryptoJsUtils.convertWordArrayToUint8Array(encrypted_words);

            // Convert the data to a list of bits
            const bits = str_to_bitstring(encrypted_bytes);
            for (const bit of bits) {

                yield bit;
            }
        }
    }
}
