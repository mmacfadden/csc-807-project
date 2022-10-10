export class EndianUtils {

    private static _littleEndian: boolean

    static {
        const arrayBuffer = new ArrayBuffer(2);
        const uint8Array = new Uint8Array(arrayBuffer);
        const uint16array = new Uint16Array(arrayBuffer);
        uint8Array[0] = 0xAA; // set first byte
        uint8Array[1] = 0xBB; // set second byte
        if (uint16array[0] === 0xBBAA) {
            EndianUtils._littleEndian = true;
        }
    }

    public static isLittleEndian() {
        return this._littleEndian;
    }

    public static ensureBigEndian(numberAsBytes: ArrayBufferLike): ArrayBufferLike {
        if (EndianUtils._littleEndian) {
            return this.swapBytes(numberAsBytes, 32);
        } else {
            return numberAsBytes;
        }
    }

    public static swapBytes(buf: ArrayBuffer, numberBitSize: number): ArrayBufferLike {
        const dst = new ArrayBuffer(buf.byteLength);
        const bytes = new Uint8Array(dst);
        bytes.set(new Uint8Array(buf));

        const len = bytes.length;
        let holder;

        if (numberBitSize === 16) {
            // 16 bit
            for (var i = 0; i < len; i += 2) {
                holder = bytes[i];
                bytes[i] = bytes[i + 1];
                bytes[i + 1] = holder;
            }
        } else if (numberBitSize === 32) {
            // 32 bit
            for (let i = 0; i < len; i += 4) {
                holder = bytes[i];
                bytes[i] = bytes[i + 3];
                bytes[i + 3] = holder;
                holder = bytes[i + 1];
                bytes[i + 1] = bytes[i + 2];
                bytes[i + 2] = holder;
            }
        } else {
            throw new Error("Invalid bit numberBitSize: " + numberBitSize);
        }

        return bytes.buffer;
    }
}