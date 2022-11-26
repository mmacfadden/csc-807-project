export const TEXT_50000 = {
  name: "Text 50000",
  enabledByDefault: false,
  keyPath: "id",
  schema: `{
  "id": {
    "faker": "random.alphaNumeric(10)"
  },
  "text": {
    "faker": "random.alphaNumeric(50000)"
  }
}`
};