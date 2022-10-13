import {
    ILoadTestConfig,
    LoadTester,
    IEncryptionConfig,
    IObjectStoreConfig,
    ModuleClearText,
    ModuleCryptoJsAes256
} from "../src";
import "fake-indexeddb/auto";
import {RandomStringGenerator} from "../src/util/RandomStringGenerator";
import {OPE} from "../src/ope/OPE";
import {OpeEncryptor} from "../src/ope/OpeEncryptor";

const encryption_secret = RandomStringGenerator.generate(200);
const opeKey = OpeEncryptor.generateKey();

const config: ILoadTestConfig = {
    encryptionConfig: {
        moduleId: ModuleCryptoJsAes256.MODULE_ID,
        dataSecret: encryption_secret,
        opeKey
    },
    objectStoreConfig: {
        documentSchema: {
            "id": {
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
            }
        },
        keyPath: "id"
    },
    operationCount: 1

}

LoadTester.runTests([config], indexedDB, false);