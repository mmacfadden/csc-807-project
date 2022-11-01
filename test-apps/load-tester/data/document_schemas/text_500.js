export const TEXT_500 =
{
  name: "Text 500",
  enabledByDefault: false,
  config: `{
    "keyPath": "id",
    "documentSchema": {
      "id": {
        "chance": "guid"
      },
      "text": {
        "faker": "random.alphaNumeric(500)"
      }
    }
  }`
};