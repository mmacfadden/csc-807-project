export const TEXT_500 = {
  name: "Text 500",
  enabledByDefault: false,
  keyPath: "id",
  schema: `{
  "id": {
    "chance": "guid"
  },
  "text": {
    "faker": "random.alphaNumeric(500)"
  }
}`
};