import {IDatabaseConfigData} from "./IEncryptionConfigData";
import {EIDBObjectStoreConfig} from "./EIDBObjectStoreConfig";

export class EIDBDatabaseConfig {
  private readonly _config: IDatabaseConfigData;
  private readonly _update: () => void

  constructor(config: IDatabaseConfigData, update: () => void) {
    this._config = config;
    this._update = update;
  }

  public addObjectStoreConfig(objectStore: string, keyPath: string | string[] | null): void {
    if (this._config.objectStores[objectStore]) {
      throw new Error("Object store configuration already exists for object store: " + objectStore);
    }

    this._config.objectStores[objectStore] = {
      keyPath,
      indices: {}
    };

    this._update();
  }

  public getObjectStoreConfig(objectStore: string): EIDBObjectStoreConfig {
    const config = this._config.objectStores[objectStore];
    if (!config) {
      throw new Error("Object store configuration does not exist for object store: " + objectStore);
    }

    return new EIDBObjectStoreConfig(config, () => {
      this._update();
    });
  }

  public deleteObjectStoreConfig(objectStore: string): void {
    delete this._config.objectStores[objectStore];
    this._update();
  }
}