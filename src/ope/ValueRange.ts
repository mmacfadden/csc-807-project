/**
 * A range of consecutive integers with the specified boundaries (both inclusive)
 */
export class ValueRange {
    private _start: number = 0;
    private _end: number = 0;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;

        if (start > end) {
            throw new Error("Invalid range: the start of the range is greater than the end");
        }
    }

    public toString(): string {
        return `ValueRange(${this._start}, ${this._end})`
    }

    public toJSON(): any {
        return {
            start: this._start,
            end: this._end
        }
    }

    public equals(other: ValueRange): boolean {
        return this._start == other.start && this.end == other.end;
    }

    public get start(): number {
        return this._start;
    }

    public set start(start: number) {
        if (typeof start !== "number") {
            throw new Error("Invalid range start: must be integer")
        }

        this._start = start;
    }

    public get end(): number {
        return this._end;
    }

    public set end(end: number) {
        if (typeof end !== "number") {
            throw new Error("Invalid range end: must be integer")
        }

        this._end = end;
    }

    public size(): number {
        return this._end - this._start + 1;
    }


    /**
     * """Return a number of bits required to encode any value within the range"""
     */
    public range_bit_size() {
        return Math.ceil(Math.log2(this.size()));
    }

    /**
     * Check if the number is within the range
     * @param num
     */
    public contains(num: number): boolean {
        return num >= this._start && num <= this._end;
    }

    public copy(): ValueRange {
        return new ValueRange(this._start, this._end);
    }
}