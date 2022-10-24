export const MOCK_CUSTOMER =
{
  name: "Customer",
  enabledByDefault: true,
  config: `{
    "keyPath": "id",
    "documentSchema": {
      "id": {
        "chance": "guid"
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
      "phoneNumber": {
        "faker": "phone.phoneNumber"
      },
      "biography": {
        "faker": "random.words(100)"
      },
      "age": {
        "faker": "datatype.number({\\"max\\": 90})"
      },
      "birthday": {
        "faker": "datatype.datetime()"
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
    }
  }`
};