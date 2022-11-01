export const TEXT_50000 =
{
  name: "Text 50000",
  enabledByDefault: false,
  config: `{
    "keyPath": "id",
    "documentSchema": {
      "id": {
        "chance": "guid"
      },
      "text": {
        "faker": "random.alphaNumeric(50000)"
      }
    }
  }`
};