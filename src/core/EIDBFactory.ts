import {EIDBOpenDBRequest} from "./EIDBOpenDBRequest";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IDBDatabase} from "fake-indexeddb";
import {IEncryptionConfig} from "../config";
import {EncryptionModule, EncryptionModuleFactory} from "../module";
import {OpeEncryptor} from "../ope/OpeEncryptor";

export class EIDBFactory implements IDBFactory {

    public static create(delegate: IDBFactory, config: any): EIDBFactory {
        return new EIDBFactory(delegate, config);
    }

    private _delegate: IDBFactory;
    private readonly _encryptionModule: EncryptionModule;
    private readonly _valueMapper: EIDBValueMapper ;

    constructor(delegate: IDBFactory, config: IEncryptionConfig) {
        this._delegate = delegate;
        this._encryptionModule = EncryptionModuleFactory.createModule(config);
        const opeEncryptor = new OpeEncryptor(config.secret);
        this._valueMapper = new EIDBValueMapper(this._encryptionModule, opeEncryptor);
    }

    public encryptionModuleId(): string {
        return this._encryptionModule.moduleId();
    }

    public initEncryption(): Promise<void> {
        return this._encryptionModule.init()
    }

    public cmp(first: any, second: any): number {
        return this._delegate.cmp(first, second);
    }

    public databases(): Promise<IDBDatabaseInfo[]> {
        return this._delegate.databases();
    }

    public open(name: string, version?: number): EIDBOpenDBRequest {
        const request = this._delegate.open(name, version);
        return new EIDBOpenDBRequest(request, this._valueMapper,(d: IDBDatabase) => this._valueMapper.dbMapper.map(d));
    }

    public deleteDatabase(name: string): EIDBOpenDBRequest {
        const request = this._delegate.deleteDatabase(name);
        return new EIDBOpenDBRequest(
            request,
            this._valueMapper,
            (d: IDBDatabase) => this._valueMapper.dbMapper.map(d));
    }
}