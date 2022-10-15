import {DocumentGenerator} from "../src/loadtest/DocumentGenerator";
import { encode, decode } from "@msgpack/msgpack";

const schema = {
    id: {
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
    },
    biography: {
        faker: "lorem.paragraphs()"
    },
    age: {
        faker: "datatype.number()"
    },
    birthday: {
        faker: "datatype.datetime()"
    },
    array: {
        faker: "datatype.array()"
    }
}

const doc = DocumentGenerator.generateDocument(schema);

const encoded: Uint8Array = encode(doc);
const serialized = JSON.stringify(doc);

console.log(`msgpack size: ${encoded.length}`);
console.log(`json size: ${serialized.length}`);

const decoded: any = decode(encoded);

console.log(decoded.birthday.constructor)

