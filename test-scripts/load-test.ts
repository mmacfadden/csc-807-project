import {
  LoadTester,
  ModuleClearText,
  ModuleCryptoJsAes256,
  EncryptionConfigManager,
  ModuleTwoFish,
  ModuleBlowfish,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes256,
  ModuleCryptoJsAes128,
  ModuleTripleSec,
  ModuleNodeCryptoAes128
} from "../src";
import "fake-indexeddb/auto";

const objectStoreConfig = {
  documentSchema: {
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
  },
  keyPath: "id"
}

const encryptionConfigs = [
  // EncryptionConfigManager.generateConfig(ModuleClearText.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID),
  EncryptionConfigManager.generateConfig(ModuleCryptoJsAes128.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes256.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes128.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleTwoFish.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleBlowfish.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleCryptoJsTripleDes.MODULE_ID),
  // EncryptionConfigManager.generateConfig(ModuleTripleSec.MODULE_ID),
];
const operationCount = 30;
const quiet = false;

async function test() {
  const results = await LoadTester.testEncryptionConfigs(
      encryptionConfigs,
      operationCount,
      objectStoreConfig,
      indexedDB,
      quiet
  );

  console.log(results);
}

test();