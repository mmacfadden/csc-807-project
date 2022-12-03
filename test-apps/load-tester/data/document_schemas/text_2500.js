export const TEXT_2500 = {
  name: "Text 2500",
  enabledByDefault: false,
  keyPath: "id",
  schema: `{
  "id": {
    "faker": "random.alphaNumeric(10)"
  },
  "text": {
    "faker": "random.alphaNumeric(2500)"
  }
}`
};