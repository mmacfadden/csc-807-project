export const MOCK_CUSTOMER =
{
  name: "Mock Customer",
  enabledByDefault: true,
  config: `{
    "keyPath": "id",
    "documentSchema": {
      "id": {
        "chance": "guid"
      },
      "firstName": {
        faker: "name.firstName"
      },
      lastName: {
        faker: "name.lastName"
      },
      accountNumber: {
        faker: "finance.account"
      },
      phoneNumber: {
        faker: "phone.phoneNumber"
      },
      biography: {
        faker: "lorem.paragraphs()"
      },
      age: {
        faker: "datatype.number()"
      },
      birthday: {
        faker: "datatype.datetime()"
      },
      arrayData: {
        faker: "datatype.array()"
      }
    }
  }`
};