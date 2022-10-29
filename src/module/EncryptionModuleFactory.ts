import {
  EncryptionModule,
  ModuleBlowfish,
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes256,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoChaCha20,
  ModuleRC5,
  ModuleXSalsa20NaCl,
  ModuleChaCha20,
  ModuleSM4CBC,
  ModuleTwoFish
} from "./";

/**
 * A factory class that creates a WebStorageEncryptionModule based on a
 * supplied configuration object.
 */
export class EncryptionModuleFactory {
  /**
   * Creates a new WebStorageEncryptionModule base on the config passed in.
   *
   * @param moduleId
   *   The id of the module to create.
   *
   * @returns The created module of the correct type.
   *
   * @throws If the config.moduleId is not recognized.

   */
  public static createModule(moduleId: string): EncryptionModule {
    switch (moduleId) {
      case ModuleCryptoJsAes256.MODULE_ID:
        return new ModuleCryptoJsAes256();

      case ModuleCryptoJsAes128.MODULE_ID:
        return new ModuleCryptoJsAes128();

      case ModuleCryptoJsTripleDes.MODULE_ID:
        return new ModuleCryptoJsTripleDes();

      case ModuleNodeCryptoAes128.MODULE_ID:
        return new ModuleNodeCryptoAes128();

      case ModuleNodeCryptoAes256.MODULE_ID:
        return new ModuleNodeCryptoAes256();

      case ModuleNodeCryptoChaCha20.MODULE_ID:
        return new ModuleNodeCryptoChaCha20();

      case ModuleBlowfish.MODULE_ID:
        return new ModuleBlowfish();

      case ModuleTwoFish.MODULE_ID:
        return new ModuleTwoFish();

      case ModuleRC5.MODULE_ID:
        return new ModuleRC5();

      case ModuleXSalsa20NaCl.MODULE_ID:
        return new ModuleXSalsa20NaCl();

      case ModuleChaCha20.MODULE_ID:
        return new ModuleChaCha20();

      case ModuleSM4CBC.MODULE_ID:
        return new ModuleSM4CBC();

      case ModuleClearText.MODULE_ID:
        return new ModuleClearText();

      default:
        throw new Error("Unknown module id: " + moduleId);
    }
  }
}