export const TEXT_5000 =
{
  name: "Text 5000",
  enabledByDefault: false,
  config: `{
    "keyPath": "id",
    "documentSchema": {
      "id": {
        "chance": "guid"
      },
      "text": {
        "faker": "random.alphaNumeric(5000)"
      }
    }
  }`
};