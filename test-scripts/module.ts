import {ModuleNodeCryptoAes128} from "../src/module/ModuleNodeCryptoAes128";

async function test() {
  const value = "my string";

  const module = new ModuleNodeCryptoAes128("my secret key1");
  await module.init();

  const encrypted = await module.encrypt(value);
  const decrypted = await module.decrypt(encrypted);

  console.log(decrypted);
}


test();
