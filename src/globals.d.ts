//
// This file provides typescript definitions for JavaScript libraries that
// did not have them. The declarations only contain the methods that this
// project uses.
//

declare module "triplesec" {
  export class Encryptor {
    constructor(args: { key: Buffer, rng?: any, version?: any })

    public run(args: { data: Buffer, salt?: Buffer, progress_hook?: any, extra_keymaterial?: number }, cb: (err, red: Buffer) => void);
  }

  export class Decryptor {
    constructor(args: { key: Buffer })

    public run(args: { data: Buffer }, cb: (err, red: Buffer) => void);
  }
}

declare module "twofish" {
  export function twofish(): ITwoFish;

  export interface ITwoFish {
    stringToByteArray(str: string): number[];

    byteArrayToString(arr: number[]): string;

    encrypt(key: number[], pt: number[]): number[];

    decrypt(key: number[], ct: number[]): number[];
  }
}