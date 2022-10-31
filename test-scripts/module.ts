import {ModuleCryptoJsAes256, ModuleSM4CBC, ModuleXSalsa20NaCl} from "../src/";


async function test() {
  const value = {
    id: 'dd067c33-6b7e-536e-9ee4-46b819645c84'
  };

  const module = new ModuleCryptoJsAes256();
  const encryptionSecret = module.createRandomEncryptionSecret();
  module.init(encryptionSecret);

  const encrypted = module.encrypt(value);
  const decrypted = module.decrypt(encrypted);

  // console.log(decrypted);
}


test();
