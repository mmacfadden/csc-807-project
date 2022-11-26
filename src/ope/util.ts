import {assert} from "../util/assert";

/**
 * Convert one byte to a list of bits
 */
export function byte_to_bitstring(byte: number) {
  // assert(byte >= 0 && byte <= 0xff, "byte must be between 0x0 and 0xff: " + byte);
  // There are niftier ways of doing this, but this is the fastest.
  return [
    byte >> 7 & 1,
    byte >> 6 & 1,
    byte >> 5 & 1,
    byte >> 4 & 1,
    byte >> 3 & 1,
    byte >> 2 & 1,
    byte >> 1 & 1,
    byte >> 0 & 1,
  ]
}

/**
 * Convert a string to a list of bits
 * @param data
 */
export function str_to_bitstring(data: Uint8Array): number[] {
  const bit_list: number[] = []

  for (let data_byte of data) {
    for (let bit of byte_to_bitstring(data_byte)) {
      bit_list.push(bit)
    }
  }

  return bit_list;
}

