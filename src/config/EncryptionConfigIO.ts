import * as CryptoJS from 'crypto-js';
import {IEncryptionConfig} from "./IEncryptionConfig";
import {NamespacedStorage} from "./NamespacedStorage";

/**
 * Stores and retrieves the encryption configuration for the Encrypted
 * Indexed DB system.  The configuration is encrypted using a cryptographic
 * key derived from the user's password.  When the user changes their
 * password, the configuration will be re-encrypted with a new key
 * derived from the new password.
 *
 * Note that while the configuration defines how data is encrypted within
 * IndexedDB, the encryption configuration is stored within Local Storage.
 */
export class EncryptionConfigIO {
  /**
   * The LocalStorage key suffix that stores the encrypted configuration.
   */
  public static readonly CONFIG_KEY = "_config";

  public static configSetForUser(storage: Storage, storageKeyPrefix: string, username: string): boolean {
    const ns = new NamespacedStorage(storage, storageKeyPrefix, username);
    return ns.hasItem(EncryptionConfigIO.CONFIG_KEY);
  }

  private readonly _storage: NamespacedStorage;
  private readonly _storageKeyPrefix: string;
  private readonly _username: string;
  private readonly _encryptionKey: string;

  constructor(storage: Storage, storageKeyPrefix: string, username: string, encryptionKey: string) {
    if (!storage) {
      throw new Error("The storage must be defined");
    }
    this._storage = new NamespacedStorage(storage, storageKeyPrefix, username);

    if (!username) {
      throw new Error("The username must be a non-empty string");
    }
    this._username = username;

    if (!encryptionKey) {
      throw new Error("The encryptionKey must be a non-empty string");
    }
    this._encryptionKey = encryptionKey;

    if (!storageKeyPrefix) {
      throw new Error("The storageKeyPrefix must be a non-empty string");
    }
    this._storageKeyPrefix = storageKeyPrefix;
  }

  /**
   * Determines if the config is set for a given user.
   *
   * @returns True if the config is set, false otherwise.
   */
  public configSet(): boolean {
    return this._storage.getItem(EncryptionConfigIO.CONFIG_KEY) !== null;
  }

  public validate(): void {
    if (this.configSet()) {
      this.getConfig();
    }
  }

  /**
   * Gets the current configuration using the user's password to decrypt
   * the stored configuration.
   *
   * @returns The current encryption config for the user.
   *
   * @throws If password is anything other than a non-empty string.
   * @throws If the password is not correct.
   * @throws If a current configuration is not set for this user.
   */
  public getConfig(): IEncryptionConfig {
    const encryptedConfigData = this._storage.getItem(EncryptionConfigIO.CONFIG_KEY);
    if (!encryptedConfigData) {
      throw new Error("Encryption config is not set.");
    }

    const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(encryptedConfigData, this._encryptionKey);
    const serializedConfig = bytes.toString(CryptoJS.enc.Utf8);

    try {
      return JSON.parse(serializedConfig);
    } catch (e) {
      throw new Error("Invalid password");
    }
  }

  /**
   * Encrypts and stores the current encryption config.
   *
   * @param config
   *   The encryption config to set.
   */
  public setConfig(config: IEncryptionConfig): void {
    if (!config) {
      throw new Error("config must be set");
    }

    const configData = JSON.stringify(config, null, "");
    const encryptedConfigData = CryptoJS.AES.encrypt(configData, this._encryptionKey).toString();
    this._storage.setItem(EncryptionConfigIO.CONFIG_KEY, encryptedConfigData);
  }
}