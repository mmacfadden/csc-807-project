import {OpeEncryptor} from "../src/ope/OpeEncryptor";
import {RandomStringGenerator} from "../src";
import {EndianUtils} from "../src/util/EndianUtils";

const encryptor = new OpeEncryptor("Sx7oMWG3l3mIWuMmlh3ZHYAwitZr6dp+MgZ2Nv8sk7E=");


for(let i = 0; i < 1; i++) {
    const l1 = Math.floor(Math.random() * 20) + 1;
    const str1 = RandomStringGenerator.generate(l1).toLowerCase();

    const l2 = Math.floor(Math.random() * 20) + 1;
    const str2 = RandomStringGenerator.generate(l2).toLowerCase();

    const rel = str1.localeCompare(str2);

    const e1 = encryptor.encryptString(str1);
    const e2 = encryptor.encryptString(str2);

    const enc1AsBytes = EndianUtils.ensureBigEndian(e1.buffer);
    const enc2AsBytes = EndianUtils.ensureBigEndian(e2.buffer);

    const eRel = compareArrays(enc1AsBytes, enc2AsBytes)

    const d1 = encryptor.decryptString(e1);
    const d2 = encryptor.decryptString(e2);

    if (rel !== eRel) {
        console.log("String 1: ", str1);
        console.log("String 2: ", str2);
        console.log("Relationship: ", rel);

        console.log("Encrypted 1: ", JSON.stringify(Array.from(e1)));
        console.log("Encrypted 2: ", JSON.stringify(Array.from(e2)));
        console.log("Encrypted 1-8: ", JSON.stringify(Array.from(new Uint8Array(e1.buffer))));
        console.log("Encrypted 2-8: ", JSON.stringify(Array.from(new Uint8Array(e2.buffer))));
        console.log("Relationship: ", eRel );

        console.log("Decrypted 1: ", d1);
        console.log("Decrypted 2: ", d2);
        throw Error();
    } else {
        //console.log("correct");
    }
}

function compareArrays(bufferA: ArrayBuffer, bufferB: ArrayBuffer): number {
    const a = new Uint8Array(bufferA);
    const b = new Uint8Array(bufferB);
    const minLen = Math.min(a.length, b.length);

    for(let i = 0; i < minLen; i++) {
        const a_i = a[i];
        const b_i = b[i];

        if (a_i < b_i) {
            return -1;
        } else if (a_i > b_i) {
            return +1;
        }
    }

    if (a.length < b.length) {
        return -1;
    } else if (a.length > b.length) {
        return 1;
    } else {
        return 0;
    }
}



