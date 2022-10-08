export function assert(condition: boolean, message?: string) {
    if (!condition){
        throw new Error(`Assertion Error: ${message || ""}`);
    }
}