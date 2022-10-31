export const BASE_64_IMAGE =
{
  name: "Base64 Image",
  enabledByDefault: false,
  config: `{
    "keyPath": "fileName",
    "documentSchema": {
      "fileName": {
        "faker": "system.commonFileName(png)"
      },
      "data": {
        "faker": "random.alphaNumeric(50000)"
      }
    }
  }`
};