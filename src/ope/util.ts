import {assert} from "./errors";

/**
 * Convert one byte to a list of bits
 */
export function byte_to_bitstring(byte: number) {
    assert(byte >= 0  && byte <= 0xff, "byte must be between 0x0 and 0xff: " + byte);
    return [...Array(8)].map((x,i)=>byte>>i&1).reverse();
}

/**
 * A generator function to extract each byte from the byte array.
 * @param data
 */
export function* data_to_byte_list(data: Uint8Array): Generator<number> {
    for (let c of data) {
        yield c;
    }
}

/**
 * Convert a string to a list of bits
 * @param data
 */
export function str_to_bitstring(data: Uint8Array): number[] {
    assert(data instanceof Uint8Array, "Data must be an instance of Uint8Array");
    const byte_list = data_to_byte_list(data);
    const bit_list: number[] = []

    for (let data_byte of byte_list) {
        for (let bit of byte_to_bitstring(data_byte)) {
            bit_list.push(bit)
        }
    }

    return bit_list;
}

