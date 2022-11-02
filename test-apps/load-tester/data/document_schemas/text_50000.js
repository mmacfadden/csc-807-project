export const TEXT_50000 = {
  name: "Text 50000",
  enabledByDefault: false,
  keyPath: "id",
  schema: `{
  "id": {
    "chance": "guid"
  },
  "text": {
    "faker": "random.alphaNumeric(50000)"
  }
}`
};