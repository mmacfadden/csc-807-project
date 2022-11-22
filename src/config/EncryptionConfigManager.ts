import * as CryptoJS from 'crypto-js';
import {IEncryptionConfig} from "./IEncryptionConfig";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EncryptionModuleFactory} from "../module";
import {RandomStringGenerator} from "../util";
import {NamespacedStorage} from "./NamespacedStorage";
import {EncryptionConfigIO} from "./EncryptionConfigIO";

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
    return EncryptionConfigIO.configSetForUser(this._storage, this._storageKeyPrefix, username);
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

    const salt = this._getSaltForUser(username);
    const currentKey = EncryptionConfigManager._deriveKey(currentPassword, salt);
    const currentIO = new EncryptionConfigIO(this._storage, this._storageKeyPrefix, username, currentKey);
    const config = currentIO.getConfig();

    const newKey = EncryptionConfigManager._deriveKey(newPassword, salt);
    const newIo = new EncryptionConfigIO(this._storage, this._storageKeyPrefix, username, newKey);
    newIo.setConfig(config);
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
  public openConfig(username: string, password: string): EncryptionConfigIO {
    if (!username) {
      throw new Error("The username must be a non-empty string");
    }

    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    const salt = this._getSaltForUser(username);
    const key = EncryptionConfigManager._deriveKey(password, salt);

    const configIO = new EncryptionConfigIO(this._storage, this._storageKeyPrefix, username, key);
    configIO.validate();
    return configIO;
  }

  private _getSaltForUser(username: string): CryptoJS.lib.WordArray {
    const ns = new NamespacedStorage(this._storage, this._storageKeyPrefix, username);

    let saltAsBase64 = ns.getItem(EncryptionConfigManager.SALT_KEY);

    if (!saltAsBase64) {
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      saltAsBase64 = CryptoJS.enc.Base64.stringify(salt);
      ns.setItem(EncryptionConfigManager.SALT_KEY, saltAsBase64);
    }

    return CryptoJS.enc.Base64.parse(saltAsBase64);
  }
}