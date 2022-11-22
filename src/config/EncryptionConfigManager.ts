import * as CryptoJS from 'crypto-js';
import {IEncryptionConfig} from "./IEncryptionConfig";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EncryptionModuleFactory} from "../module";
import {RandomStringGenerator} from "../util";

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
  /**
   * The default LocalStorage key prefix for all values the
   * EncryptionConfigManager stores.
   */
  public static readonly DEFAULT_LOCAL_STORAGE_KEY_PREFIX = "__indexed_db_encryption";

  /**
   * The LocalStorage key suffix that stores the unique salt used to derive
   * the encryption key from the user's password.
   */
  public static readonly SALT_KEY = "_salt";

  /**
   * The LocalStorage key suffix that stores the encrypted configuration.
   */
  public static readonly CONFIG_KEY = "_config";

  /**
   * A convenience method to create a new configuration for a specific
   * module with randomized keys and secrets.
   *
   * @param encryptionModuleId
   *   The id of the encryption module to use.
   *
   * @param moduleParams
   *   Optional module specific parameters.
   */
  public static async generateConfig(encryptionModuleId: string, moduleParams?: any): Promise<IEncryptionConfig> {
    const opeKey = OpeEncryptor.generateKey();
    const module = EncryptionModuleFactory.createModule(encryptionModuleId);
    const dataSecret = module.createRandomEncryptionSecret(moduleParams);
    const userDbPrefix = RandomStringGenerator.generate(15);

    return {
      moduleId: encryptionModuleId,
      moduleParams: moduleParams,
      dataSecret,
      opeKey,
      userDbPrefix
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
   * Determines if the config is set for a given user.
   *
   * @param username
   *   The username to check if the config is set for.
   *
   * @returns True if the config is set, false otherwise.
   */
  public configSet(username: string): boolean {
    const configKey = this._resolveKey(username, EncryptionConfigManager.CONFIG_KEY);
    return this._storage.getItem(configKey) !== null;
  }

  /**
   * Changes the password for the existing configuration.  This will cause
   * the encryption configuration to be re-encrypted using a new key derived
   * from the user's new password.
   *
   * @param username
   *   The username to change the password for.
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
  public changePassword(username: string, currentPassword: string, newPassword: string): void {
    if (!username) {
      throw new Error("The username must be a non-empty string");
    }

    if (!currentPassword) {
      throw new Error("The currentPassword must be a non-empty string");
    }

    if (!newPassword) {
      throw new Error("The newPassword must be a non-empty string");
    }

    const config = this.getConfig(username, currentPassword);
    this.setConfig(config, username, newPassword);
  }

  /**
   * Gets the current configuration using the user's password to decrypt
   * the stored configuration.
   *
   * @param username
   *   The username of the user to get the config for.
   * @param password
   *   The user's password.
   *
   * @returns The current encryption config for the user.
   *
   * @throws If password is anything other than a non-empty string.
   * @throws If the password is not correct.
   * @throws If a current configuration is not set for this user.
   */
  public getConfig(username: string, password: string): IEncryptionConfig {
    if (!username) {
      throw new Error("The username must be a non-empty string");
    }

    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    // First we must retrieve the salt.
    const saltKey = this._resolveKey(username, EncryptionConfigManager.SALT_KEY);
    const saltAsBase64 = this._storage.getItem(saltKey);
    if (!saltAsBase64) {
      throw new Error("Can not decrypt data because the key salt was not present in storage.");
    }

    const salt = CryptoJS.enc.Base64.parse(saltAsBase64);

    // Now we derive the key with the same salt.
    const key = EncryptionConfigManager._deriveKey(password, salt);

    // Get the encrypted data and decrypt it.
    const encryptionStorageKey = this._resolveKey(username, EncryptionConfigManager.CONFIG_KEY);
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
   * @param username
   *    The username to set the config for.
   * @param password
   *   The password to used to encrypt the configuration.
   */
  public setConfig(config: IEncryptionConfig, username: string, password: string): void {
    if (!config) {
      throw new Error("Config must be set");
    }

    if (!username) {
      throw new Error("The username must be a non-empty string");
    }

    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    // Everytime we store the config we will derive a new key by using a new
    // salt.  This avoids a dictionary attack. But we also have to store the
    // salt to be able to derive the correct key.
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const saltAsBase64 = CryptoJS.enc.Base64.stringify(salt);
    const saltKey = this._resolveKey(username, EncryptionConfigManager.SALT_KEY);
    this._storage.setItem(saltKey, saltAsBase64);

    // Derive the new key using the password and the salt.
    const key = EncryptionConfigManager._deriveKey(password, salt);

    // We now use the derived key to encrypt the config and store it.
    const configData = JSON.stringify(config, null, "");
    const encryptedConfigData = CryptoJS.AES.encrypt(configData, key).toString();
    const configKey = this._resolveKey(username, EncryptionConfigManager.CONFIG_KEY)
    this._storage.setItem(configKey, encryptedConfigData);
  }

  /**
   * A helper method to result the user scoped LocalStorage key
   * with the key prefix.
   *
   * @param username
   *   The username to get the key for.
   * @param key
   *   The specific key to get the string for.
   *
   * @private
   */
  private _resolveKey(username: string, key: string): string {
    const hash = CryptoJS.enc.Base64.stringify(CryptoJS.SHA512(username));
    return `${this._storageKeyPrefix}_${key}_${hash}`;
  }
}