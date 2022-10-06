import * as CryptoJS from 'crypto-js';
import {IEncryptionConfig} from "./IEncryptionConfig";

/**
 * Stores and retrieves the encryption configuration.  The encryption
 * configuration which likely contains the symmetric key will be encrypted
 * with a password.  If the password is changes, the config will be
 * decrypted with the current password, and re-encrypted with the new
 * password.
 */
export class EncryptionConfigManager {
  private static _CONFIG_PROPERTY = "__indexed_db_encryption_config__";

  private readonly _storage: Storage;

  /**
   * Creates a new EncryptionConfigManager.
   *
   * @param storage
   *   The Storage to use to save the config data.
   */
  constructor(storage: Storage) {
    this._storage = storage;
  }

  /**
   * Determines if the config is currently set.
   *
   * @returns True if the config is set, false otherwise.
   */
  public isConfigSet(): boolean {
    return this._storage.getItem(EncryptionConfigManager._CONFIG_PROPERTY) !== null;
  }

  /**
   * Changes the password for the existing configuration.
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

    this.setConfig(key, newPassword);
  }

  /**
   * Changes the password for the existing configuration.
   *
   * @param password
   *   The current password.
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

    const encryptedKeyData = this._storage.getItem(EncryptionConfigManager._CONFIG_PROPERTY);

    if (!encryptedKeyData) {
      throw new Error("Encryption config is not set.");
    }

    const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(encryptedKeyData, password);
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
   *   The password to use to encrypt the configuration.
   */
  public setConfig(config: IEncryptionConfig, password: string): void {
    if (!config) {
      throw new Error("Config must be set");
    }

    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    const configData = JSON.stringify(config, null, "");
    const encryptedKeyData = CryptoJS.AES.encrypt(configData, password).toString();
    this._storage.setItem(EncryptionConfigManager._CONFIG_PROPERTY, encryptedKeyData);
  }
}