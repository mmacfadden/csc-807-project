import {OpeEncryptor} from "../src/ope/OpeEncryptor";
import {RandomStringGenerator} from "../src";

const encryptor = new OpeEncryptor("7cymJAo+30tUwt9f20LkKHJ1XMsufge9y6dYHKxM2yc=");

for(let i = 0; i < 100; i++) {
    const l1 = Math.floor(Math.random() * 20) + 1;
    const str1 = RandomStringGenerator.generate(l1).toLowerCase();

    const l2 = Math.floor(Math.random() * 20) + 1;
    const str2 = RandomStringGenerator.generate(l2).toLowerCase();

    const rel = str1.localeCompare(str2);

    const e1 = encryptor.encryptString(str1);
    const e2 = encryptor.encryptString(str2);

    const eRel = e1.localeCompare(e2);

    const d1 = encryptor.decryptString(e1);
    const d2 = encryptor.decryptString(e2);

    console.log("String 1: ", str1);
    console.log("String 2: ", str2);
    console.log("Relationship: ", rel);

    console.log("Encrypted 1: ", e1);
    console.log("Encrypted 2: ", e2);
    console.log("Relationship: ", eRel );

    console.log("Decrypted 1: ", d1);
    console.log("Decrypted 2: ", d2);

    if (rel !== eRel) {
        console.log("String 1: ", str1);
        console.log("String 2: ", str2);
        console.log("Relationship: ", rel);

        console.log("Encrypted 1: ", e1);
        console.log("Encrypted 2: ", e2);
        console.log("Relationship: ", eRel );

        console.log("Decrypted 1: ", d1);
        console.log("Decrypted 2: ", d2);
        throw Error();
    } else {
        //console.log("correct");
    }


}



