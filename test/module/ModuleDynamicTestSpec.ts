import {expect} from 'chai';
import {
  ModuleClearText,
  ModuleTwoFish,
  ModuleBlowfish,
  ModuleCryptoJsTripleDes,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleRC5,
  ModuleNodeCryptoChaCha20,
  ModuleXSalsa20NaCl,
  ModuleChaCha20,
  ModuleSM4CBC,
  EncryptionModule
} from '../../src/';

const MODULES = [
  new ModuleCryptoJsAes256(),
  new ModuleCryptoJsAes128(),
  new ModuleCryptoJsTripleDes(),
  new ModuleNodeCryptoAes128(),
  new ModuleNodeCryptoAes256(),
  new ModuleBlowfish(),
  new ModuleTwoFish(),
  new ModuleRC5(),
  new ModuleNodeCryptoChaCha20(),
  new ModuleXSalsa20NaCl(),
  new ModuleChaCha20(),
  new ModuleSM4CBC(),
  new ModuleClearText()
];

const TEST_DOCUMENT = {
  string: "A String Property",
  number: 10.2,
  boolean: true,
  date: new Date(),
  null: null,
  array: ["1", 2, false, true, null],
  object: {
    nested: "nested"
  }
}

function test(module: EncryptionModule, params: any) {
  const secret = module.createRandomEncryptionSecret();
  module.init(secret, params);
  const cypherText = module.encrypt(TEST_DOCUMENT);
  const decrypted = module.decrypt(cypherText);
  expect(decrypted).to.deep.eq(TEST_DOCUMENT);
}
describe('Encryption Module Correctness', () => {
  MODULES.forEach(module => {
    it(`${module.moduleId()} Encrypt / Decrypt w/ Message Pack`, async () => {
      const params = {serializationScheme: "msgpack"};
      test(module, params);
    });
  });

  MODULES.forEach(module => {
    it(`${module.moduleId()} Encrypt / Decrypt w/ BSON`, async () => {
      const params = {serializationScheme: "bson"};
      test(module, params);
    });
  });
});