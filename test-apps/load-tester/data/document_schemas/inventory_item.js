export const INVENTORY_ITEM =
{
  name: "Inventory Item",
  enabledByDefault: true,
  config: `{
    "keyPath": "sku",
    "documentSchema": {
      "sku": {
        "chance": "guid"
      },
      "description": {
        "faker": "random.words(53)"
      },
      "price": {
        "faker": "datatype.float({\\"max\\": 1000})"
      },
      "qty": {
        "faker": "datatype.number({\\"max\\": 1000})"
      }
    }
  }`
};