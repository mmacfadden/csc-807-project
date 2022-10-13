import {OpeEncryptor} from "../src/ope/OpeEncryptor";

const key = "Sx7oMWG3l3mIWuMmlh3ZHYAwitZr6dp+MgZ2Nv8sk7E=";

const encryptor = new OpeEncryptor(key);

const enc001 = encryptor.encryptString("001");
console.log(enc001);