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
  ModuleSM4CBC
} from "../src";
import "fake-indexeddb/auto";

const objectStoreConfig = {
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
  },
  keyPath: "id",
  name: "test-document"
}


const operationCount = 10;
const quiet = false;

async function test() {
  const encryptionConfigs: IEncryptionConfig[] = [
    // await EncryptionConfigManager.generateConfig(ModuleClearText.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes128.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes256.MODULE_ID),
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

  const results = await LoadTester.testEncryptionConfigs(
      encryptionConfigs,
      [objectStoreConfig],
      operationCount,
      indexedDB,
      quiet
  );

  // console.log(JSON.stringify(results));
}

test();