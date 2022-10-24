import All_SCHEMAS from "./document_schemas/all_schemas.js";
import ALL_MODULES from "./modules.js"

export class Persistence {
  static SCHEMAS_KEY = "__indexed_db_load_tester_schemas";
  static TEST_CONFIG_KEY = "__indexed_db_load_tester_test_config";

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
    // FIXME take the enabled by default flag into consideration for the schemas.
    const data = localStorage.getItem(Persistence.TEST_CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      const default_config = {
        selectedModules: ALL_MODULES,
        selectedSchemas: All_SCHEMAS
      }
      Persistence.saveTestConfig(default_config);
      return default_config;
    }
  }

  static saveTestConfig(testConfig) {
    localStorage.setItem(Persistence.TEST_CONFIG_KEY, JSON.stringify(testConfig, null, ""));
  }
}