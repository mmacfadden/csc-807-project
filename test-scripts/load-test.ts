import {
  IEncryptionConfig,
  LoadTester,
  EncryptionConfigManager,
  ILoadTesterHooks,
  ILoadTestResult
} from "../src";
import "fake-indexeddb/auto";
import fs from "fs";


const testDir  = "./testing/text_5000_all_modules";

export function parseConfig(c: string) {
  return eval(`(${c})`);
}

export function parseSchema(s: any): any {
  const {name, enabledByDefault, schema, keyPath} = s;
  return {
    name, enabledByDefault, keyPath, schema: parseConfig(schema)
  };
}

async function test() {
  const configFileContents = fs.readFileSync( `${testDir}/test-config.json`, {encoding:'utf8', flag:'r'});
  const testConfig = JSON.parse(configFileContents);

  // TODO this is common code to the load test app.
  const moduleParams = {
    serializationScheme: testConfig.preEncryptionSerialization
  }

  const encryptionConfigs: IEncryptionConfig[] = [];
  for (let i = 0; i < testConfig.selectedModules.length; i++) {
    const moduleConfig = await EncryptionConfigManager.generateConfig(testConfig.selectedModules[i], moduleParams);
    encryptionConfigs.push(moduleConfig);
  }

  const schemas = testConfig.selectedSchemas.map(parseSchema).map((s: any) => {
        const {name, keyPath, schema} = s;
        return {name, keyPath, schema}
      }
  );

  const hooks: ILoadTesterHooks = {
    testingStarted() {
        console.log("Encrypted IndexedDB Load Testing Started\n");
    },
    testingFinished() {
      console.log("Encrypted IndexedDB Load Testing Finished\n");
    },
    testStarted(moduleId: string, schema: string) {
      console.log(`Test Started:  ${moduleId} w/ ${schema}`);
    },
    testFinished(result: ILoadTestResult) {
      console.log(`Test Finished: ${result.moduleId} w/ ${result.schemaName}\n`);
    }
  }

  const results = await LoadTester.testEncryptionConfigs(
      encryptionConfigs,
      schemas,
      testConfig.documentsPerTest,
      indexedDB,
      hooks);

  console.log("Writing JSON test results to: testing/results/node.json");
  const resultJson = JSON.stringify(results, null, "  ");
  fs.writeFileSync( `${testDir}/results/node.json`, resultJson );

}

test();