import All_SCHEMAS from "./document_schemas/all_schemas.js";
import ALL_MODULES from "./modules.js"

export class Persistence {
  static SCHEMAS_KEY = "__indexed_db_load_tester_schemas";
  static TEST_CONFIG_KEY = "__indexed_db_load_tester_test_config";
  static RESULTS_CONFIG_KEY = "__indexed_db_load_tester_test_results";

  static reset() {
    localStorage.removeItem(Persistence.SCHEMAS_KEY);
    localStorage.removeItem(Persistence.TEST_CONFIG_KEY);
    localStorage.removeItem(Persistence.RESULTS_CONFIG_KEY);
  }

  static loadResults() {
    const data = localStorage.getItem(Persistence.RESULTS_CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  static saveResults(results) {
    localStorage.setItem(Persistence.RESULTS_CONFIG_KEY, JSON.stringify(results));
  }

  static loadSchemas() {
    const data = localStorage.getItem(Persistence.SCHEMAS_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      Persistence.saveSchemas(All_SCHEMAS);
      return All_SCHEMAS;
    }
  }

  static saveSchemas(schemas) {
    localStorage.setItem(Persistence.SCHEMAS_KEY, JSON.stringify(schemas, null, ""));
  }

  static loadTestConfig() {
    const data = localStorage.getItem(Persistence.TEST_CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      const default_config = {
        preEncryptionSerialization: "msgpack",
        keyEncryptionScheme: "hash",
        documentsPerTest: 30,
        selectedModules: ALL_MODULES,
        selectedSchemas: All_SCHEMAS.filter(v => v.enabledByDefault)
      }
      Persistence.saveTestConfig(default_config);
      return default_config;
    }
  }

  static saveTestConfig(testConfig) {
    localStorage.setItem(Persistence.TEST_CONFIG_KEY, JSON.stringify(testConfig, null, ""));
  }
}