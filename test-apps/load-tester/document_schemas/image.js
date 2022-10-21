export const MOCK_IMAGE =
{
  name: "Image",
  enabledByDefault: false,
  config: `{
    keyPath: "id",
    documentSchema: {
      id: {
        chance: "guid"
      },
      data: {
        faker: "random.alphaNumeric(10000)"
      }
    }
  }`
};