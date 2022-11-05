import {
  IEncryptionConfig,
  LoadTester,
  ModuleClearText,
  ModuleCryptoJsAes256,
  EncryptionConfigManager,
  ModuleTwoFish,
  ModuleBlowfish,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes256,
  ModuleCryptoJsAes128,
  ModuleNodeCryptoAes128,
  ModuleRC5,
  ModuleNodeCryptoChaCha20,
  ModuleXSalsa20NaCl,
  ModuleChaCha20,
  ModuleSM4CBC,
  ILoadTesterHooks,
  ILoadTestResult
} from "../src";
import "fake-indexeddb/auto";

const objectStoreConfig = {
  name: "Customer",
  keyPath: "id",
  schema: {
    id: {
      chance: "guid"
    },
    firstName: {
      faker: "name.firstName"
    },
    lastName: {
      faker: "name.lastName"
    },
    accountNumber: {
      faker: "finance.account"
    },
    phoneNumber: {
      faker: "phone.phoneNumber"
    },
    biography: {
      faker: "lorem.paragraphs()"
    },
    age: {
      faker: "datatype.number()"
    },
    birthday: {
      faker: "datatype.datetime()"
    },
    arrayData: {
      faker: "datatype.array()"
    }
  }
}

const operationCount = 10;

async function test() {
  const encryptionConfigs: IEncryptionConfig[] = [
    await EncryptionConfigManager.generateConfig(ModuleClearText.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes128.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes256.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes128.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleNodeCryptoChaCha20.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleTwoFish.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleBlowfish.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleCryptoJsTripleDes.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleRC5.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleChaCha20.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleXSalsa20NaCl.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleSM4CBC.MODULE_ID),
  ];

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
      [objectStoreConfig],
      operationCount,
      indexedDB,
      hooks
  );

  console.log("Writing JSON test results to: load-test-results.json");
  console.log("Writing CSV test results to: load-test-results.csv\n ");
  // console.log(JSON.stringify(results));
}

test();