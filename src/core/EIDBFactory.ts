import {EIDBOpenDBRequest} from "./EIDBOpenDBRequest";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IDBDatabase} from "fake-indexeddb";
import {EncryptionModule, EncryptionModuleFactory} from "../module";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {DatabaseNameUtil} from "../util/DatabaseNameUtil";
import {EncryptionConfig} from "../config";
import {NoOpKeyEncryptor} from "./NoOpKeyEncryptor";
import {OpeKeyEncryptor} from "./OpeKeyEncryptor";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import {SymmetricKeyEncryptor} from "./SymmetricKeyEncryptor";
import {Sha512KeyEncryptor} from "./Sha512KeyEncryptor";
import {EIDBDatabase} from "./EIDBDatabase";

export class EIDBFactory implements IDBFactory {

  private readonly _delegate: IDBFactory;
  private readonly _encryptionModule: EncryptionModule;
  private readonly _valueMapper: EIDBValueMapper;
  private readonly _encryptionConfig: EncryptionConfig;
  private readonly _dbMapper: (d: IDBDatabase) => EIDBDatabase;

  /**
   * Creates a new EIDBFactory that wraps a normal Indexed
   * Database and layers on the specified encryption.
   *
   * @param delegate
   *   The underlying Indexed DB instance to use to actually
   *   store data.
   *
   * @param config
   *   The configuration which specifies how to encrypt data.
   */
  constructor(delegate: IDBFactory, config: EncryptionConfig) {
    if (!delegate) {
      throw new Error("delegate must be defined");
    }

    if (!config) {
      throw new Error("config must be defined");
    }

    this._delegate = delegate;
    this._encryptionConfig = config;
    this._encryptionModule = EncryptionModuleFactory.createModule(config.moduleId());

    let keyEncryptor: EIDBKeyEncryptor;
    switch (this._encryptionConfig.keyEncryption()) {
      case "none":
        keyEncryptor = new NoOpKeyEncryptor();
        break;

      case "ope":
        keyEncryptor = new OpeKeyEncryptor(new OpeEncryptor(config.opeKey()));
        break;

      case "symmetric":
        const keyConfig = this._encryptionConfig.symmetricKeyEncryptionKey();
        if (!keyConfig) {
          throw new Error("Invalid symmetricKeyEncryptionKey: " + config);
        }
        keyEncryptor = new SymmetricKeyEncryptor(keyConfig);
        break;

      case "hash":
        keyEncryptor = new Sha512KeyEncryptor();
        break;
    }

    this._valueMapper = new EIDBValueMapper(
        this._encryptionConfig, this._encryptionModule, keyEncryptor!);

    this._dbMapper = (d: IDBDatabase) => this._valueMapper.dbMapper.map(d);

    this._encryptionModule.init(
        this._encryptionConfig.dataSecret(),
        this._encryptionConfig.moduleParams()
    );
  }

  /**
   * @returns the id of the encryption module being used to encrypt data.
   */
  public encryptionModuleId(): string {
    return this._encryptionModule.moduleId();
  }

  /**
   * @inheritDoc
   */
  public cmp(first: any, second: any): number {
    return this._delegate.cmp(first, second);
  }

  /**
   * @inheritDoc
   */
  public async databases(): Promise<IDBDatabaseInfo[]> {
    // TODO we can actually get this from our config, if
    //  the underlying browser does not hae this method.
    const names = await this._delegate.databases();
    return names.map(info => {
      return {
        name: DatabaseNameUtil.unprefixName(info.name!),
        version: info.version
      };
    })
  }

  /**
   * @inheritDoc
   */
  public open(name: string, version?: number): EIDBOpenDBRequest {
    const prefixedName = this._resolveDatabaseName(name);
    if (!this._encryptionConfig.databaseConfigExists(name)) {
      this._encryptionConfig.addDatabaseConfig(name);
    }
    const request = this._delegate.open(prefixedName, version);
    return new EIDBOpenDBRequest(request, this._valueMapper, this._dbMapper);
  }

  /**
   * @inheritDoc
   */
  public deleteDatabase(name: string): EIDBOpenDBRequest {
    const prefixedName = this._resolveDatabaseName(name);
    // TODO ideally these would both happen together.
    this._encryptionConfig.removeDatabaseConfig(name);
    const request = this._delegate.deleteDatabase(prefixedName);
    return new EIDBOpenDBRequest(request, this._valueMapper, this._dbMapper);
  }

  /**
   * A helper method that computes the prefixed database name.
   *
   * @param name The original name of the database.
   *
   * @returns
   *   A uniquely prefixed database name specific to the user.
   *
   * @private
   */
  private _resolveDatabaseName(name: string): string {
    return DatabaseNameUtil.prefixName(this._encryptionConfig.userDbPrefix(), name);
  }
}