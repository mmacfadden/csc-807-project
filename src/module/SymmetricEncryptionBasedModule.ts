import {EncryptionModule} from "./EncryptionModule";
import {encode, decode} from "@msgpack/msgpack";
import {serialize, deserialize} from "bson";

export type SerializationScheme = "json" | "msgpack" | "bson";

/**
 * An abstract base class for symmetric key encryption.
 */
export abstract class SymmetricEncryptionBasedModule extends EncryptionModule {
  private readonly _textEncoder: TextEncoder;
  private readonly _textDecoder: TextDecoder;
  private _serializationScheme: SerializationScheme;

  /**
   * Creates a new module.
   *
   * @param moduleId
   *   The unique module id for this type of encryption module.
   */
  protected constructor(moduleId: string) {
    super(moduleId);

    this._textEncoder = new TextEncoder();
    this._textDecoder = new TextDecoder("utf-8");
    this._serializationScheme = "json";
  }

  public init(encryptionSecret: string, moduleParams?: any) {
    const {serializationScheme} = moduleParams || {};
    if (serializationScheme) {
      this._serializationScheme = serializationScheme;
    }
  }

  /**
   *  Encrypts a JavaScript object.
   *
   * @param plainText
   *   The unencrypted data to encrypt.
   */
  public encrypt(plainText: any): Uint8Array {
    const serializedDocument = this._serializeDocument(plainText);
    return this._encryptSerializedDocument(serializedDocument);
  }

  /**
   * Decrypts object data.
   *
   * @param cipherText
   *   The encrypted text to decrypt.
   */
  public decrypt(cipherText: Uint8Array): any {
    const serializedDocument = this._decryptSerializedDocument(cipherText);
    return this._deserializeDocument(serializedDocument);
  }

  /**
   * A helper method to serialize the document into a byte array.
   *
   * @param plainText
   *   The plain text document to serialize.
   *
   * @returns
   *   The document serialized to bytes.
   * @private
   */
  private _serializeDocument(plainText: any): Uint8Array {
    if (this._serializationScheme === "msgpack") {
      return encode(plainText);
    } else if (this._serializationScheme === "bson") {
      return serialize(plainText);
    } else {
      const json = JSON.stringify(plainText);
      return this._textEncoder.encode(json);
    }
  }

  /**
   * A helper method to deserialize a byte array into the
   * original document.
   *
   * @param plainText
   *   The plain text document represented as bytes.
   *
   * @returns
   *   The document deserialized.
   * @private
   */
  private _deserializeDocument(plainText: Uint8Array): any {
    if (this._serializationScheme === "msgpack") {
      return decode(plainText);
    } else if (this._serializationScheme === "bson") {
      return deserialize(plainText)
    } else {
      const json = this._textDecoder.decode(plainText);
      return JSON.parse(json);
    }
  }

  /**
   * Encrypts a document that has been already serialized from a JavaScript
   * object into a byte array.
   *
   * @param plaintext
   *   The plain text serialized as bytes.
   *
   * @protected
   */
  protected abstract _encryptSerializedDocument(plaintext: Uint8Array): Uint8Array;

  /**
   * Decrypts the cipher text into the original serialized form of the
   * plain text document.
   *
   * @param ciphertext
   *   The encrypted data to decrypt.
   *
   * @protected
   */
  protected abstract _decryptSerializedDocument(ciphertext: Uint8Array): Uint8Array;
}
