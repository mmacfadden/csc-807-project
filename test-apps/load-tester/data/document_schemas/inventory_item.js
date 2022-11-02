export const INVENTORY_ITEM =
{
  name: "Inventory Item",
  enabledByDefault: true,
  keyPath: "sku",
  schema: `
{
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
}`
};