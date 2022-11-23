import {IObjectStoreConfigData} from "./IEncryptionConfigData";

export class EIDBObjectStoreConfig {
  private readonly _config: IObjectStoreConfigData;
  private readonly _update: () => void

  constructor(config: IObjectStoreConfigData, update?: () => void) {
    if (!config) {
      throw new Error("config must be defined");
    }

    this._config = config;
    this._update = update || (() => {});
  }

  public getKeyPath(): string | string[] | null {
    return this._config.keyPath;
  }

  public createIndex(name: string, keyPath: string | string[]): void {
    if (!name) {
      throw new Error("index must be defined");
    }

    if (!keyPath) {
      throw new Error("keyPath must be defined");
    }

    if (this._config.indices[name]) {
      throw new Error("An index with the specified name already exists: " + name);
    }

    this._config.indices[name] = keyPath;
    this._update();
  }

  public getIndex(name: string): string | string[] {
    if (!name) {
      throw new Error("name must be defines");
    }

    if (!this._config.indices[name]) {
      throw new Error("The index does not exist: " + name);
    }

    return this._config.indices[name];
  }

  public removeIndex(name: string): void {
    if (!this._config.indices[name]) {
      throw new Error("An index with the specified name does not exist: " + name);
    }
    delete this._config.indices[name];
    this._update();
  }

  public toJSON(): any {
    return JSON.parse(JSON.stringify(this._config));
  }
}