import {EIDBFactory, EncryptionConfigManager, IEncryptionConfig, ModuleClearText, ModuleTwoFish} from "../src/";
import "fake-indexeddb/auto";
import {OpeEncryptor} from "../src/ope/OpeEncryptor";

const data = "my data to encrypt!";

const tf = new ModuleTwoFish("secret");

tf.encrypt(data)
    .then(enc => {
        return tf.decrypt(enc);
    })
    .then(dec => {
        console.log(dec);
    })
    .catch(e => {
        console.error(e);
    });