import * as CryptoJS from 'crypto-js';
import {IEncryptionConfigData} from "./IEncryptionConfigData";
import {NamespacedStorage} from "./NamespacedStorage";
import {EncryptionConfig} from "./EncryptionConfig";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {RandomStringGenerator} from "../util";
import {EncryptionModuleFactory} from "../module";


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
export class EncryptionConfigStorage {
  /**
   * The default LocalStorage key prefix for all values the
   * EncryptionConfigManager stores.
   */
  public static readonly DEFAULT_LOCAL_STORAGE_KEY_PREFIX = "__indexed_db_encryption";

  /**
   * The LocalStorage key suffix that stores the encrypted configuration.
   */
  public static readonly LOCAL_CONFIG_KEY = "_config";

  /**
   * The LocalStorage key suffix that stores the unique salt used to derive
   * the encryption key from the user's password.
   */
  public static readonly LOCAL_SALT_KEY = "_salt";

  public static SESSION_ENCRYPTION_CONFIG = "_encryption_config";
  public static SESSION_ENCRYPTION_KEY = "_encryption_key";
  public static SESSION_USERNAME = "_demo_username";

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

  public static restoreFromSession(
      localStorage: Storage,
      sessionStorage: Storage,
      storageKeyPrefix?: string): EncryptionConfigStorage | null {

    if (!storageKeyPrefix) {
      storageKeyPrefix = EncryptionConfigStorage.DEFAULT_LOCAL_STORAGE_KEY_PREFIX;
    }

    const username = new NamespacedStorage(sessionStorage, storageKeyPrefix, null)
        .getItem(EncryptionConfigStorage.SESSION_USERNAME);

    if (username) {
      const storage = new EncryptionConfigStorage(localStorage, username, sessionStorage, storageKeyPrefix);
      storage._attemptRestoreFromSession();
      return storage;
    } else {
      return null;
    }
  }

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
  public static generateDefaultConfig(encryptionModuleId: string, moduleParams?: any): IEncryptionConfigData {
    const opeKey = OpeEncryptor.generateKey();
    const module = EncryptionModuleFactory.createModule(encryptionModuleId);
    const dataSecret = module.createRandomEncryptionSecret(moduleParams);
    const userDbPrefix = RandomStringGenerator.generate(15);

    return {
      moduleId: encryptionModuleId,
      moduleParams: moduleParams,
      dataSecret,
      opeKey,
      userDbPrefix,
      databases: {}
    }
  }

  private readonly _storageKeyPrefix: string;
  private readonly _username: string;
  private readonly _localStorage: NamespacedStorage;
  private readonly _sessionStorage: NamespacedStorage | null;
  private _encryptionKey: string | null;
  private _config: EncryptionConfig | null;

  constructor(localStorage: Storage, username: string, sessionStorage?: Storage, storageKeyPrefix?: string) {
    if (!localStorage) {
      throw new Error("The localStorage must be defined");
    }

    if (!username) {
      throw new Error("The username must be a non-empty string");
    }
    this._username = username;

    if (!storageKeyPrefix) {
      this._storageKeyPrefix = EncryptionConfigStorage.DEFAULT_LOCAL_STORAGE_KEY_PREFIX;
    } else {
      this._storageKeyPrefix = storageKeyPrefix;
    }

    this._localStorage = new NamespacedStorage(localStorage, this._storageKeyPrefix, username);

    if (sessionStorage) {
      this._sessionStorage = new NamespacedStorage(sessionStorage, this._storageKeyPrefix, null);
    } else {
      this._sessionStorage = null;
    }

    this._encryptionKey = null;

    this._config = null;
  }

  public username(): string {
    return this._username;
  }

  private _attemptRestoreFromSession(): void {
    if (this._sessionStorage) {
      const configJson: IEncryptionConfigData =
          JSON.parse(this._sessionStorage.getItem(EncryptionConfigStorage.SESSION_ENCRYPTION_CONFIG)!);
      this._setConfigFromData(configJson);

      this._encryptionKey =
          this._sessionStorage.getItem(EncryptionConfigStorage.SESSION_ENCRYPTION_KEY);
    }
  }

  public open(password: string, defaultConfig: () => IEncryptionConfigData): void {
    if (!password) {
      throw new Error("The password must be a non-empty string");
    }

    const salt = this._getSaltForUser();
    this._encryptionKey = EncryptionConfigStorage._deriveKey(password, salt);

    let configData = this._localStorage.hasItem(EncryptionConfigStorage.LOCAL_CONFIG_KEY) ?
        this._loadConfigData(this._encryptionKey) :
        (() => {
          const data = defaultConfig();
          this._writeConfig(data);
          return data;
        })();

    if (this._sessionStorage) {
      new NamespacedStorage(this._sessionStorage.rawStorage(), this._storageKeyPrefix, null)
          .setItem(EncryptionConfigStorage.SESSION_USERNAME, this._username);
    }


    this._setConfigFromData(configData);
  }

  /**
   * Determines if the config is set for a given user.
   *
   * @returns True if the config is set, false otherwise.
   */
  public isOpen(): boolean {
    return this._config !== null;
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
  public getConfig(): EncryptionConfig {
    this._assertOpen();
    return this._config!;
  }

  public close(): void {
    this._assertOpen();
    this._config = null;
    this._encryptionKey = null;

    if (this._sessionStorage) {
      this._sessionStorage.removeItem(EncryptionConfigStorage.SESSION_ENCRYPTION_CONFIG);
      this._sessionStorage.removeItem(EncryptionConfigStorage.SESSION_ENCRYPTION_KEY);

      new NamespacedStorage(this._sessionStorage.rawStorage(), this._storageKeyPrefix, null)
          .removeItem(EncryptionConfigStorage.SESSION_USERNAME);
    }
  }

  /**
   * Changes the password for the existing configuration.  This will cause
   * the encryption configuration to be re-encrypted using a new key derived
   * from the user's new password.
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
    this._assertOpen();

    if (!currentPassword) {
      throw new Error("The currentPassword must be a non-empty string");
    }

    if (!newPassword) {
      throw new Error("The newPassword must be a non-empty string");
    }

    const salt = this._getSaltForUser();

    // This will inadvertently check the credentials.
    const currentKey = EncryptionConfigStorage._deriveKey(currentPassword, salt);
    this._loadConfigData(currentKey);

    this._encryptionKey = EncryptionConfigStorage._deriveKey(newPassword, salt);
    this._writeConfig(this._config!.toJSON());
  }

  private _loadConfigData(encryptionKey: string): IEncryptionConfigData {
    let encryptedConfigData = this._localStorage.getItem(EncryptionConfigStorage.LOCAL_CONFIG_KEY);
    const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(encryptedConfigData!, encryptionKey);

    try {
      const configJson = bytes.toString(CryptoJS.enc.Utf8);
      const parsed = JSON.parse(configJson);
      this._writeConfigToSession(configJson);
      return parsed;
    } catch (e) {
      throw new Error("Invalid password");
    }
  }

  private _setConfigFromData(config: IEncryptionConfigData): void {
    const updateFunction = () => {
      this._assertOpen();
      this._writeConfig(this._config!.toJSON());
    };

    this._config = new EncryptionConfig(config, updateFunction);
  }

  /**
   * Encrypts and stores the current encryption config.
   */
  private _writeConfig(configData: IEncryptionConfigData): void {
    const configJson = JSON.stringify(configData, null, "");
    const encryptedConfigData = CryptoJS.AES.encrypt(configJson, this._encryptionKey!).toString();
    this._localStorage.setItem(EncryptionConfigStorage.LOCAL_CONFIG_KEY, encryptedConfigData);

    this._writeConfigToSession(configJson);
  }

  private _writeConfigToSession(configJson: string): void {
    if (this._sessionStorage) {
      this._sessionStorage.setItem(EncryptionConfigStorage.SESSION_ENCRYPTION_CONFIG, configJson);
      this._sessionStorage.setItem(EncryptionConfigStorage.SESSION_ENCRYPTION_KEY, this._encryptionKey!);
    }
  }

  private _getSaltForUser(): CryptoJS.lib.WordArray {
    let saltAsBase64 = this._localStorage.getItem(EncryptionConfigStorage.LOCAL_SALT_KEY);
    if (!saltAsBase64) {
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      saltAsBase64 = CryptoJS.enc.Base64.stringify(salt);
      this._localStorage.setItem(EncryptionConfigStorage.LOCAL_SALT_KEY, saltAsBase64);
    }

    return CryptoJS.enc.Base64.parse(saltAsBase64);
  }

  private _assertOpen(): void {
    if (!this.isOpen()) {
      throw new Error("The EncryptionConfigStorage is not open");
    }
  }
}