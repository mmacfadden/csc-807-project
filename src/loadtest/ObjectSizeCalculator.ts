export class ObjectSizeCalculator {
    public static sizeOf(obj: any): number {
        let bytes = 0;

        if(obj !== null && obj !== undefined) {
            if (Array.isArray(obj)) {
                bytes = obj.reduce(
                    (previousValue, currentValue) => previousValue + ObjectSizeCalculator.sizeOf(currentValue),
                    0
                )
            } else if (obj instanceof Date) {
                bytes = 8;
            } else {
                switch(typeof obj) {
                    case 'number':
                        bytes = 8;
                        break;
                    case 'string':
                        bytes = obj.length * 2;
                        break;
                    case 'boolean':
                        bytes = 4;
                        break;
                    case 'object':
                        if(obj.constructor === Object) {
                            for(let key in obj) {
                                if(obj.hasOwnProperty(key)){
                                    bytes += ObjectSizeCalculator.sizeOf(key)
                                    bytes += ObjectSizeCalculator.sizeOf(obj[key]);
                                }
                            }
                        } else {
                            throw new Error("Unhandled object type");
                        }
                        break;
                }
            }

        }

        return bytes;
    }
}