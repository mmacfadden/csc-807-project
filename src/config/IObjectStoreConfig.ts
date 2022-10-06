import {IIndexConfig} from "./IIndexConfig";

export interface IObjectStoreConfig {
    name: string;
    keyPath: string[];
    indices: {[key: string]: IIndexConfig};
}