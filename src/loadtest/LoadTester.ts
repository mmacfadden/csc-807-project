import {EIDBFactory, IEncryptionConfig} from "../";
import {Timing} from "./Timing";
import {ILoadTesterHooks} from "./ILoadTesterHooks";
import {ILoadTestResult} from "./ILoadTestResult";
import {ILoadTestConfig} from "./ILoadTestConfig";
import {RequestUtils} from "../util/RequestUtils";
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
   * @param operationCount
   *   The number of entries to read and write to Storage.
   * @param valueSizeBytes
   *   The number of characters in the value to store.
   * @param storage
   *   The HTML5 Storage object to use to store data.
   * @param quiet
   *   Whether to suppress log output.
   * @param hooks
   *   Callback hooks to get status during testing.
   *
   * @returns A string array of all test results in CSV format.
   */
  public static async testEncryptionConfigs(encryptionConfigs: IEncryptionConfig[],
                                            operationCount: number,
                                            objectStoreConfig: IObjectStoreConfig,
                                            indexedDb: IDBFactory,
                                            quiet: boolean,
                                            hooks?: ILoadTesterHooks): Promise<ILoadTestResult[]> {
    const testConfigs: ILoadTestConfig[] = encryptionConfigs.map(ec => {
      return {
        encryptionConfig: ec,
        objectStoreConfig,
        operationCount: operationCount
      };
    });

    return LoadTester.runTests(testConfigs, indexedDb, quiet, hooks);
  }

  /**
   * A helper to run a specific set of tests.
   *
   * @param testConfigs
   *   The encryption module configs to test.
   * @param indexedDb
   *   The HTML5 IndexedDB object to use to store data.
   * @param quiet
   *   Whether to suppress log output.
   * @param hooks
   *   Callback hooks to get status during testing.
   *
   * @returns A string array of all test results in CSV format.
   */
  public static async runTests(testConfigs: ILoadTestConfig[],
                               indexedDb: IDBFactory,
                               quiet: boolean,
                               hooks?: ILoadTesterHooks): Promise<ILoadTestResult[]> {
    if (hooks) {
      hooks.testingStarted(testConfigs);
    }

    if (!quiet) {
      console.log("IndexedDB Encryption Load Testing Started");
    }

    const results: ILoadTestResult[] = [];

    for await (let result of LoadTester._generateTests(testConfigs, indexedDb, quiet, hooks)) {
      results.push(result);
    }

    if (!quiet) {
      console.log("IndexedDB Encryption Load Testing Completed");
    }

    return results;
  }

  /**
   * An async generator helper that generates the set of test cases.
   * @param testConfigs
   *   The encryption module configs to test.
   * @param indexedDb
   *   The HTML5 IndexedDB object to use to store data.
   * @param quiet
   *   Whether to suppress log output.
   * @param hooks
   *   Callback hooks to get status during testing.
   *
   * @returns A generator of strings that are the CSV output for each test.
   */
  private static async* _generateTests(testConfigs: ILoadTestConfig[],
                                       indexedDb: IDBFactory,
                                       quiet: boolean,
                                       hooks?: ILoadTesterHooks): AsyncIterableIterator<ILoadTestResult> {
    for (const i in testConfigs) {
      const config = testConfigs[i];
      const tester = new LoadTester(config, indexedDb);
      yield tester.loadTest(quiet, hooks);
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

    if (!config.objectStoreConfig.documentSchema) {
      throw new Error("objectStoreConfig.documentSchema must be defined");
    }

    if (!config.objectStoreConfig.keyPath) {
      throw new Error("objectStoreConfig.keyPath must be defined");
    }

    this._config = config;

    if (!indexedDb) {
      throw new Error("indexedDb must be defined");
    }

    this._idb = EIDBFactory.create(indexedDb, config.encryptionConfig);
  }

  /**
   * Executes a single load test for the specified configuration.
   *
   * @param quiet
   *   Whether to suppress output.
   * @param hooks
   *   Callback hooks to get status during testing.
   */
  public async loadTest(quiet: boolean, hooks?: ILoadTesterHooks): Promise<ILoadTestResult> {

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

      console.log("object store created");
    }

    const db = await RequestUtils.requestToPromise(openReq);

    console.log("db created");

    if (hooks) {
      hooks.testStarted(this._idb.encryptionModuleId());
    }

    if (!quiet) {
      console.log(`Testing ${this._idb.encryptionModuleId()}`);
    }

    await this._idb.initEncryption();

    Timing.startMeasurementSession();

    for (let i = 0; i < this._config.operationCount; i++) {
      const doc: any = DocumentGenerator.generateDocument(this._config.objectStoreConfig.documentSchema);

      const tx = db.transaction(LoadTester._OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(LoadTester._OBJECT_STORE_NAME);

      Timing.writeStart(i);
      await RequestUtils.requestToPromise(store.add(doc));
      Timing.writeEnd(i);

      Timing.readStart(i);
      const readDoc = await RequestUtils.requestToPromise(store.get(doc.id));
      console.log(readDoc);
      Timing.readEnd(i);
    }

    const cumulativeReadTime = Timing.getTotalReadTime();
    const cumulativeWriteTime = Timing.getTotalWriteTime();

    const totalTimeMs = cumulativeWriteTime + cumulativeReadTime;
    const averageReadWriteTimeMs = totalTimeMs / this._config.operationCount;
    const averageWriteTimeMs = cumulativeWriteTime / this._config.operationCount;
    const averageReadTimeMs = cumulativeReadTime / this._config.operationCount;

    // FIXME how do we calculate the size of a document????
    //const totalBytes = this._config.operationCount * this._config.valueSizeBytes;
    const totalBytes = 10;
    const avgReadThroughputKbps = (totalBytes / 1000) / (cumulativeReadTime / 1000);
    const avgWriteThroughputKbps = (totalBytes / 1000) / (cumulativeWriteTime / 1000);

    const result: ILoadTestResult = {
      moduleId: this._idb.encryptionModuleId(),
      operationCount: this._config.operationCount,
      totalTimeMs,
      averageWriteTimeMs,
      averageReadTimeMs,
      averageReadWriteTimeMs,
      avgReadThroughputKbps,
      avgWriteThroughputKbps
    };

    if (hooks) {
      hooks.testFinished(result);
    }

    return result;
  }
}