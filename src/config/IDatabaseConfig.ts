import {IObjectStoreConfig} from "./IObjectStoreConfig";

export interface IDatabaseConfig {
    name: string;
    stores: {[key: string]: IObjectStoreConfig}
}

