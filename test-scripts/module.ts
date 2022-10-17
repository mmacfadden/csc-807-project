
import {ModuleRC5} from "../src/";


async function test() {
  const value = "my string";

  const module = new ModuleRC5();
  await module.init("my secret key1");

  const encrypted = await module.encrypt(value);
  const decrypted = await module.decrypt(encrypted);

  console.log(decrypted);
}


test();
