/**
 * Represents the configuration that defines how data will be encrypted
 * within IndexedDB.
 */
export interface IEncryptionConfigData {
  /**
   * The module id of the encryption module to use.
   */
  moduleId: string;

  /**
   * Option module specific parameters.
   */
  moduleParams?: any;

  /**
   * The module specific data secret used to encrypt the data.
   */
  dataSecret: string;

  /**
   * The key used for Order Preserving Encryption that is used for encrypting
   * keys and indices that need to support range queries.
   */
  opeKey: string;

  /**
   * A unique prefix for database names.
   */
  userDbPrefix: string;

  databases: {[key: string]: IDatabaseConfigData}
}

export interface IDatabaseConfigData {
  objectStores: {[key: string]: IObjectStoreConfigData}
}

export interface IObjectStoreConfigData {
  keyPath: string | string[] | null;
  indices: {[key: string]: string | string[]}
}