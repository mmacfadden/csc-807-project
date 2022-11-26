/**
 * Convert a string to a list of bits
 * @param data
 */
export function str_to_bitstring(data: Uint8Array): number[] {
  const bit_list: number[] = [];

  for (let data_byte of data) {
    bit_list.push(data_byte >> 7 & 1);
    bit_list.push(data_byte >> 6 & 1);
    bit_list.push(data_byte >> 5 & 1);
    bit_list.push(data_byte >> 4 & 1);
    bit_list.push(data_byte >> 3 & 1);
    bit_list.push(data_byte >> 2 & 1);
    bit_list.push(data_byte >> 1 & 1);
    bit_list.push(data_byte >> 0 & 1);
  }

  return bit_list;
}

