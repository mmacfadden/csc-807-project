import {IEncryptionConfigData, KeyEncryptionStrategy} from "./IEncryptionConfigData";
import {EIDBDatabaseConfig} from "./EIDBDatabaseConfig";

export class EncryptionConfig {
  private readonly _config: IEncryptionConfigData;
  private readonly _update: ((config: IEncryptionConfigData) => void) | undefined

  constructor(config: IEncryptionConfigData, update?: (config: IEncryptionConfigData) => void) {
    if (!config) {
      throw new Error("config must be define");
    }
    this._config = config;

    if (!update) {
      this._update = () => {};
    } else {
      this._update = update;
    }
  }

  /**
   * The module id of the encryption module to use.
   */
  moduleId(): string {
    return this._config.moduleId;
  }

  /**
   * Option module specific parameters.
   */
  moduleParams(): any {
    return this._config.moduleParams;
  }

  /**
   * The module id of the encryption module to use.
   */
  keyEncryption(): KeyEncryptionStrategy {
    return "none";
  }

  /**
   * The module specific data secret used to encrypt the data.
   */
  dataSecret(): string {
    return this._config.dataSecret;
  }

  /**
   * The key used for Order Preserving Encryption that is used for encrypting
   * keys and indices that need to support range queries.
   */
  opeKey(): string {
    return this._config.opeKey;
  }

  /**
   * A unique prefix for database names.
   */
  userDbPrefix(): string {
    return this._config.userDbPrefix;
  }

  public databaseConfigExists(database: string): boolean {
    return this._config.databases[database] !== undefined;
  }

  public addDatabaseConfig(database: string): void {
    if (this._config.databases[database]) {
      throw new Error("Database configuration already exists for database: " + database);
    }

    this._config.databases[database] = {
      objectStores: {}
    };

    this._save();
  }

  public getDatabaseConfig(database: string): EIDBDatabaseConfig {
    const config = this._config.databases[database];
    if (!config) {
      throw new Error("Database configuration does not exist for database: " + database);
    }

    return new EIDBDatabaseConfig(config, () => this._save());
  }

  public removeDatabaseConfig(database: string): void {
    this.getDatabaseConfig(database);
    delete this._config.databases[database];

    this._save();
  }

  public toJSON(): IEncryptionConfigData {
    return this._config;
  }

  private _save(): void {
    if (this._update) {
      this._update(this._config);
    }
  }
}