import {ModuleCryptoJsAes256} from "../src";

async function test() {
  const value = "my string";

  const module = new ModuleCryptoJsAes256("my secret key");

  const encrypted = await module.encrypt(value);
  const decrypted = await module.decrypt(encrypted);

  console.log(decrypted);
}


test();
