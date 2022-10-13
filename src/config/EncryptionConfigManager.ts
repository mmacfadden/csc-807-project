import * as CryptoJS from 'crypto-js';
import {IEncryptionConfig} from "./IEncryptionConfig";
import {RandomStringGenerator} from "../util";
import {OpeEncryptor} from "../ope/OpeEncryptor";

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
export class EncryptionConfigManager {
  public static readonly DEFAULT_LOCAL_STORAGE_KEY_PREFIX = "__indexed_db_encryption";
  public static readonly SALT_KEY = "_salt";
  public static readonly CONFIG_KEY = "_config";

  /**
   * A convenience method to create a new configuration for a specific
   * module with randomized keys and secrets.
   *
   * @param encryptionModuleId
   *   The id of the encryption module to use.
   * @param params
   *   Option module specific parameters.
   */
  public static generateConfig(encryptionModuleId: string, params?: any): IEncryptionConfig {
    const dataSecret = RandomStringGenerator.generate(32);
    const opeKey = OpeEncryptor.generateKey();

    return {
      moduleId: encryptionModuleId,
      moduleParams: params,
      dataSecret: dataSecret,
      opeKey
    }
  }

  /**
   * A helper method to derive the encryption key from the users password
   * and a salt.
   *
   * @param password
   *   The user's password to derive the key from.
   * @param salt
   *   The random salt to use to derive the key.
   * @private
   */
  private static _deriveKey(password: string, salt: CryptoJS.lib.WordArray): string {
    const keyAsWordArray = CryptoJS.PBKDF2(password, salt, {keySize: 256 / 32});
    return CryptoJS.enc.Base64.stringify(keyAsWordArray);
  }

  private readonly _storage: Storage;
  private readonly _storageKeyPrefix: string;

  /**
   * Creates a new EncryptionConfigManager.
   *
   * @param storage
   *   The Storage to use to save the config data.
   *
   * @param storageKeyPrefix
   *   The key prefix used to store the encryption config.  If not specified then
   *   the EncryptionConfigManager.DEFAULT_CONFIG_LOCAL_STORAGE_KEY value will be
   *   used.
   */
  constructor(storage: Storage, storageKeyPrefix?: string) {
    this._storage = storage;
    this._storageKeyPrefix = storageKeyPrefix || EncryptionConfigManager.DEFAULT_LOCAL_STORAGE_KEY_PREFIX;
  }

  /**
   * Determines if the config is currently set.
   *
   * @returns True if the config is set, false otherwise.
   */
  public configSet(): boolean {
    const configKey = this._storageKeyPrefix + EncryptionConfigManager.CONFIG_KEY;
    return this._storage.getItem(configKey) !== null;
  }

  /**
   * Changes the password for the existing configuration.  This will cause
   * the encryption configuration to be re-encrypted using a new key derived
   * from the user's new password.
   *
   * @param currentPassword
   *   The currently set password.
   * @param newPassword
   *   The new password to set.
   *
   * @throws If currentPassword or newPassword are anything other than
   *         non-empty strings.
   * @throws If the currentPassword is not correct.
   * @throws If a current configuration is not set.
   */
  public changePassword(currentPassword: string, newPassword: string): void {
    if (!currentPassword || !newPassword) {
      throw new Error("Both the currentPassword and newPassword must be non-empty strings");
    }

    const key = this.getConfig(currentPassword);
    console.log("get existing config");

    this.setConfig(key, newPassword);

    console.log("stored new config existing config");
  }

  /**
   * Gets the current configuration using the user's password to decrypt
   * the stored configuration.
   *
   * @param password
   *   The current user password.
   *
   * @returns The current encryption config.
   *
   * @throws If password is anything other than a non-empty string.
   * @throws If the password is not correct.
   * @throws If a current configuration is not set.
   */
  public getConfig(password: string): IEncryptionConfig {
    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    // First we must retrieve the salt.
    const saltKey = this._storageKeyPrefix + EncryptionConfigManager.SALT_KEY;
    const saltAsBase64 = this._storage.getItem(saltKey);
    if (!saltAsBase64) {
      throw new Error("Can not decrypt data because the key salt was not present in storage.");
    }

    const salt = CryptoJS.enc.Base64.parse(saltAsBase64);

    // Now we derive the key with the same salt.
    const key = EncryptionConfigManager._deriveKey(password, salt);

    // Get the encrypted data and decrypt it.
    const encryptionStorageKey = this._storageKeyPrefix + EncryptionConfigManager.CONFIG_KEY;
    const encryptedConfigData = this._storage.getItem(encryptionStorageKey);
    if (!encryptedConfigData) {
      throw new Error("Encryption config is not set.");
    }
    const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(encryptedConfigData, key);
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
   * @param password
   *   The password to used to encrypt the configuration.
   */
  public setConfig(config: IEncryptionConfig, password: string): void {
    if (!config) {
      throw new Error("Config must be set");
    }

    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    // Everytime we store the config we will derive a new key by using a new
    // salt.  This avoids a dictionary attack. But we also have to store the
    // salt to be able to derive the correct key.
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const saltAsBase64 = CryptoJS.enc.Base64.stringify(salt);
    this._storage.setItem(this._storageKeyPrefix + EncryptionConfigManager.SALT_KEY, saltAsBase64);

    // Derive the new key using the password and the salt.
    const key = EncryptionConfigManager._deriveKey(password, salt);

    // We now use the derived key to encrypt the config and store it.
    const configData = JSON.stringify(config, null, "");
    const encryptedConfigData = CryptoJS.AES.encrypt(configData, key).toString();
    this._storage.setItem(this._storageKeyPrefix + EncryptionConfigManager.CONFIG_KEY, encryptedConfigData);
  }
}