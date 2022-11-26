export const TEXT_500 = {
  name: "Text 500",
  enabledByDefault: false,
  keyPath: "id",
  schema: `{
  "id": {
    "faker": "random.alphaNumeric(10)"
  },
  "text": {
    "faker": "random.alphaNumeric(500)"
  }
}`
};