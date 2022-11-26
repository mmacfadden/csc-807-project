export const MOCK_CUSTOMER =
{
  name: "Customer",
  enabledByDefault: true,
  keyPath: "id",
  schema: `{
  "id": {
    "faker": "random.alphaNumeric(10)"
  },
  "firstName": {
    "faker": "name.firstName"
  },
  "lastName": {
    "faker": "name.lastName"
  },
  "accountNumber": {
    "faker": "finance.account"
  },
  "active": {
    "faker": "datatype.boolean"
  },
  "phoneNumber": {
    "faker": "phone.phoneNumber"
  },
  "age": {
    "faker": "datatype.number({\\"max\\": 90})"
  },
  "address": {
    "street": {
      "faker": "address.streetAddress()"
    },
    "city": {
      "faker": "address.city()"
    },
    "state": {
      "faker": "address.state()"
    },
    "zip": {
      "faker": "address.zipCode()"
    }
  }
}`
};