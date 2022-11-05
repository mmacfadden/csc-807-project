import {EIDBFactory, IDocIoRecord, IEncryptionConfig, ObjectSizeCalculator} from "../";
import {Timing} from "./Timing";
import {ILoadTesterHooks} from "./ILoadTesterHooks";
import {ILoadTestResult} from "./ILoadTestResult";
import {ILoadTestConfig} from "./ILoadTestConfig";
import {RequestUtils} from "../util";
import {DocumentGenerator} from "./DocumentGenerator";
import {IObjectStoreConfig} from "./IObjectStoreConfig";


/**
 * This class implements convenience logic that automates load testing
 * of several encryption modules.
 */
export class LoadTester {

  /**
   * The name of the database that is used to read and write documents to
   * during load testing.
   * @private
   */
  private static readonly _DB_NAME = "__load_test_db__";

  /**
   * The name of the object store within the database to use for testing.
   * @private
   */
  private static readonly _OBJECT_STORE_NAME = "test_object_store";

  /**
   * A helper method that tests all known encryption modules.
   *
   * @param encryptionConfigs
   *   The encryption configurations to test.
   * @param objectStoreConfigs
   *
   * @param operationCount
   *   The number of entries to read and write to Storage.
   *   The configuration used to create object stores and documents.
   * @param indexedDb
   *   The HTML5 IndexedDB object to use to store data.
   * @param hooks
   *   Callback hooks to get status during testing.
   *
   * @returns A string array of all test results in CSV format.
   */
  public static async testEncryptionConfigs(encryptionConfigs: IEncryptionConfig[],
                                            objectStoreConfigs: IObjectStoreConfig[],
                                            operationCount: number,
                                            indexedDb: IDBFactory,
                                            hooks?: ILoadTesterHooks): Promise<ILoadTestResult[]> {
    const testConfigs: ILoadTestConfig[] = objectStoreConfigs.flatMap(osc => {
      return encryptionConfigs.map(ec => {
        return {
          encryptionConfig: ec,
          objectStoreConfig: osc,
          operationCount: operationCount
        };
      });
    });

    return await LoadTester.runTests(testConfigs, indexedDb, hooks);
  }

  /**
   * A helper to run a specific set of tests.
   *
   * @param testConfigs
   *   The encryption module configs to test.
   * @param indexedDb
   *   The HTML5 IndexedDB object to use to store data.
   * @param hooks
   *   Callback hooks to get status during testing.
   *
   * @returns A string array of all test results in CSV format.
   */
  public static async runTests(testConfigs: ILoadTestConfig[],
                               indexedDb: IDBFactory,
                               hooks?: ILoadTesterHooks): Promise<ILoadTestResult[]> {
    if (hooks?.testingStarted) {
      hooks.testingStarted(testConfigs);
    }

    const results: ILoadTestResult[] = [];

    for await (let result of LoadTester._generateTests(testConfigs, indexedDb, hooks)) {
      results.push(result);
    }

    if (hooks?.testingFinished) {
      hooks.testingFinished(results);
    }

    return results;
  }

  /**
   * An async generator helper that generates the set of test cases.
   * @param testConfigs
   *   The encryption module configs to test.
   * @param indexedDb
   *   The HTML5 IndexedDB object to use to store data.
   * @param hooks
   *   Callback hooks to get status during testing.
   *
   * @returns A generator of strings that are the CSV output for each test.
   */
  private static async* _generateTests(testConfigs: ILoadTestConfig[],
                                       indexedDb: IDBFactory,
                                       hooks?: ILoadTesterHooks): AsyncIterableIterator<ILoadTestResult> {
    for (const i in testConfigs) {
      const config = testConfigs[i];
      const tester = new LoadTester(config, indexedDb);
      const result = await tester.loadTest(hooks);
      yield result;
    }
  }

  private readonly _idb: EIDBFactory;
  private readonly _config: ILoadTestConfig;

  /**
   * Constructs a LoadTester for a single test case.
   *
   * @param config
   *   The encryption module configuration.
   * @param indexedDb
   *   The HTML5 IndexedDB instance to use.
   */
  constructor(config: ILoadTestConfig, indexedDb: IDBFactory) {
    if (!config) {
      throw new Error("config must be defined");
    }

    if (!config.operationCount || config.operationCount <= 0) {
      throw new Error("operationCount must be > 0");
    }

    if (!config.objectStoreConfig) {
      throw new Error("objectStoreConfig must be defined");
    }

    if (!config.objectStoreConfig.schema) {
      throw new Error("objectStoreConfig.schema must be defined");
    }

    if (!config.objectStoreConfig.keyPath) {
      throw new Error("objectStoreConfig.keyPath must be defined");
    }

    this._config = config;

    if (!indexedDb) {
      throw new Error("indexedDb must be defined");
    }

    this._idb = EIDBFactory.create(indexedDb, config.encryptionConfig);
    this._idb.initEncryption();
  }

  /**
   * Executes a single load test for the specified configuration.
   *
   * @param hooks
   *   Callback hooks to get status during testing.
   */
  public async loadTest(hooks?: ILoadTesterHooks): Promise<ILoadTestResult> {
    const dbNames = await this._idb.databases();
    if (dbNames.findIndex(i => i.name === LoadTester._DB_NAME) >= 0) {
      const deleteRequest = this._idb.deleteDatabase(LoadTester._DB_NAME);
      await RequestUtils.requestToPromise(deleteRequest);
    }

    const openReq = this._idb.open(LoadTester._DB_NAME);
    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      db.createObjectStore(
          LoadTester._OBJECT_STORE_NAME,
          {keyPath: this._config.objectStoreConfig.keyPath}
      );
    }

    const db = await RequestUtils.requestToPromise(openReq);

    if (hooks?.testStarted) {
      hooks.testStarted(this._idb.encryptionModuleId(), this._config.objectStoreConfig.name);
    }

    let totalBytes = 0;

    const reads: IDocIoRecord[] = [];
    const writes: IDocIoRecord[] = [];

    const tx = db.transaction(LoadTester._OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(LoadTester._OBJECT_STORE_NAME);

    Timing.startMeasurementSession();

    for (let i = 0; i < this._config.operationCount; i++) {
      const doc: any = DocumentGenerator.generateDocument(this._config.objectStoreConfig.schema);
      const docSize = ObjectSizeCalculator.sizeOf(doc);
      totalBytes += docSize;

      Timing.writeStart(i);
      await RequestUtils.requestToPromise(store.add(doc));
      const readTime = Timing.writeEnd(i);
      writes.push({docSize, timeMs: readTime});

      Timing.readStart(i);
      const key = this._extractKeyFromDocument(doc);
      await RequestUtils.requestToPromise(store.get(key));
      const writeTime = Timing.readEnd(i);
      reads.push({docSize, timeMs: writeTime});

      // Clear the store to make sure we don't have any id conflicts. This does not
      // need to be part of the timing.
      await RequestUtils.requestToPromise(store.clear());

      if (hooks?.documentCompleted) {
        hooks.documentCompleted(i + 1);
      }
    }

    const cumulativeReadTime = Timing.getTotalReadTime();
    const cumulativeWriteTime = Timing.getTotalWriteTime();

    const totalTimeMs = cumulativeWriteTime + cumulativeReadTime;
    const averageReadWriteTimeMs = totalTimeMs / this._config.operationCount;
    const averageWriteTimeMs = cumulativeWriteTime / this._config.operationCount;
    const averageReadTimeMs = cumulativeReadTime / this._config.operationCount;

    const avgReadThroughputKbps = (totalBytes / 1000) / (cumulativeReadTime / 1000);
    const avgWriteThroughputKbps = (totalBytes / 1000) / (cumulativeWriteTime / 1000);

    const averageDocumentSize = totalBytes / this._config.operationCount / 1000;

    const result: ILoadTestResult = {
      moduleId: this._idb.encryptionModuleId(),
      schemaName: this._config.objectStoreConfig.name,
      operationCount: this._config.operationCount,
      reads,
      writes,
      averageDocumentSize,
      totalTimeMs,
      averageWriteTimeMs,
      averageReadTimeMs,
      averageReadWriteTimeMs,
      avgReadThroughputKbps,
      avgWriteThroughputKbps
    };

    db.close();

    if (hooks?.testFinished) {
      hooks.testFinished(result);
    }

    return result;
  }

  private _extractKeyFromDocument(doc: any): any[] {
    let {keyPath} = this._config.objectStoreConfig

    if (!Array.isArray(keyPath)) {
      return this._extractValueFromDocument(doc, keyPath);
    } else {
      return keyPath.map(p => this._extractValueFromDocument(doc, p));
    }
  }

  private _extractValueFromDocument(doc: any, path: string): any {
      const pathComponents = path.split(".");
      let curSourceVal = doc;

      for (let i = 0; i < pathComponents.length; i++) {
        const prop = pathComponents[i];
        curSourceVal = curSourceVal[prop];
        if (curSourceVal === undefined || curSourceVal === null) {
          throw new Error("Unable to extract key from document");
        }

        if (i === pathComponents.length - 1) {
          return curSourceVal;
        }
      }
  }
}