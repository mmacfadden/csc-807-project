export const TEXT_5000 = {
  name: "Text 5000",
  enabledByDefault: false,
  keyPath: "id",
  schema: `{
  "id": {
    "faker": "random.alphaNumeric(10)"
  },
  "text": {
    "faker": "random.alphaNumeric(5000)"
  }
}`
};