const {
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleNodeCryptoChaCha20,
  ModuleTwoFish,
  ModuleBlowfish,
  ModuleRC5,
  ModuleWebCryptoAes128,
  ModuleWebCryptoAes256,
  ModuleXSalsa20NaCl,
  ModuleChaCha20,
  ModuleSM4CBC,
} = EncryptedIndexedDB;

export const ALL_MODULES = [
  ModuleClearText.MODULE_ID,
  ModuleCryptoJsAes128.MODULE_ID,
  ModuleCryptoJsAes256.MODULE_ID,
  ModuleCryptoJsTripleDes.MODULE_ID,
  ModuleNodeCryptoAes128.MODULE_ID,
  ModuleNodeCryptoAes256.MODULE_ID,
  // ModuleNodeCryptoChaCha20.MODULE_ID,
  ModuleTwoFish.MODULE_ID,
  ModuleBlowfish.MODULE_ID,
  ModuleRC5.MODULE_ID,
  // ModuleWebCryptoAes128.MODULE_ID,
  // ModuleWebCryptoAes256.MODULE_ID,
  ModuleXSalsa20NaCl.MODULE_ID,
  ModuleChaCha20.MODULE_ID,
  ModuleSM4CBC.MODULE_ID,
];

export const DEFAULT_DOCUMENT_SCHEMA = {
  keyPath: "id",
  documentSchema: {
    id: {
      chance: "guid"
    },
    firstName: {
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
    },
    extraShit: {
      firstName: {
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
  }
};