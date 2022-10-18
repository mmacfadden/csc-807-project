
import {ModuleSM4CBC, ModuleXSalsa20NaCl} from "../src/";


async function test() {
  const value = "my string";

  const module = new ModuleSM4CBC();
  const encryptionSecret = await module.createRandomEncryptionSecret();
  await module.init(encryptionSecret);

  const encrypted = await module.encrypt(value);
  const decrypted = await module.decrypt(encrypted);

  console.log(decrypted);
}


test();
