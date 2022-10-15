import {
  LoadTester,
  ModuleClearText,
  ModuleCryptoJsAes256,
  EncryptionConfigManager
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

const config = EncryptionConfigManager.generateConfig(ModuleClearText.MODULE_ID)
const encryptionConfigs = [config];
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