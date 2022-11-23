import {IDatabaseConfigData} from "./IEncryptionConfigData";
import {EIDBObjectStoreConfig} from "./EIDBObjectStoreConfig";

export class EIDBDatabaseConfig {
  private readonly _config: IDatabaseConfigData;
  private readonly _update: () => void

  constructor(config: IDatabaseConfigData, update?: () => void) {
    if (!config) {
      throw new Error("config must be defined");
    }

    this._config = config;
    this._update = update || (() => {});
  }

  public addObjectStoreConfig(objectStoreName: string, keyPath: string | string[] | null): void {
    if (!objectStoreName) {
      throw new Error("objectStoreName must be defined");
    }

    if (this._config.objectStores[objectStoreName]) {
      throw new Error("Object store configuration already exists for object store: " + objectStoreName);
    }

    this._config.objectStores[objectStoreName] = {
      keyPath,
      indices: {}
    };

    this._update();
  }

  public getObjectStoreConfig(objectStoreName: string): EIDBObjectStoreConfig {
    if (!objectStoreName) {
      throw new Error("objectStoreName must be defined");
    }

    const config = this._config.objectStores[objectStoreName];
    if (!config) {
      throw new Error("Object store configuration does not exist for object store: " + objectStoreName);
    }

    return new EIDBObjectStoreConfig(config, () => {
      this._update();
    });
  }

  public deleteObjectStoreConfig(objectStoreName: string): void {
    if (!objectStoreName) {
      throw new Error("objectStoreName must be defined");
    }

    if (!this._config.objectStores[objectStoreName]) {
      throw new Error("Object store configuration does not exist for object store: " + objectStoreName);
    }

    delete this._config.objectStores[objectStoreName];
    this._update();
  }

  public toJSON() {
    return JSON.parse(JSON.stringify(this._config));
  }
}