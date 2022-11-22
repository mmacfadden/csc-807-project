import {EIDBOpenDBRequest} from "./EIDBOpenDBRequest";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IDBDatabase} from "fake-indexeddb";
import {IEncryptionConfig} from "../config";
import {EncryptionModule, EncryptionModuleFactory} from "../module";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {DatabaseNameUtil} from "../util/DatabaseNameUtil";

export class EIDBFactory implements IDBFactory {

    public static create(delegate: IDBFactory, config: IEncryptionConfig): EIDBFactory {
        return new EIDBFactory(delegate, config);
    }

    private readonly _delegate: IDBFactory;
    private readonly _encryptionModule: EncryptionModule;
    private readonly _valueMapper: EIDBValueMapper;
    private readonly _encryptionConfig: IEncryptionConfig;

    constructor(delegate: IDBFactory, config: IEncryptionConfig) {
        this._delegate = delegate;
        this._encryptionConfig = config;
        this._encryptionModule = EncryptionModuleFactory.createModule(config.moduleId);
        const opeEncryptor = new OpeEncryptor(config.opeKey);
        this._valueMapper = new EIDBValueMapper(this._encryptionModule, opeEncryptor);
    }

    public encryptionModuleId(): string {
        return this._encryptionModule.moduleId();
    }

    public initEncryption(): void {
        this._encryptionModule.init(this._encryptionConfig.dataSecret, this._encryptionConfig.moduleParams)
    }

    public cmp(first: any, second: any): number {
        return this._delegate.cmp(first, second);
    }

    public async databases(): Promise<IDBDatabaseInfo[]> {
        const names = await this._delegate.databases();
        return names.map(info => {
            return {
                name: DatabaseNameUtil.unprefixName(info.name!),
                version: info.version
            };
        })
    }

    public open(name: string, version?: number): EIDBOpenDBRequest {
        const prefixedName = this._resolveDatabaseName(name);
        const request = this._delegate.open(prefixedName, version);
        return new EIDBOpenDBRequest(request, this._valueMapper,(d: IDBDatabase) => this._valueMapper.dbMapper.map(d));
    }

    public deleteDatabase(name: string): EIDBOpenDBRequest {
        const prefixedName = this._resolveDatabaseName(name);
        const request = this._delegate.deleteDatabase(prefixedName);
        return new EIDBOpenDBRequest(
            request,
            this._valueMapper,
            (d: IDBDatabase) => this._valueMapper.dbMapper.map(d));
    }

    private _resolveDatabaseName(name: string): string {
        return DatabaseNameUtil.prefixName(this._encryptionConfig.userDbPrefix, name);
    }
}