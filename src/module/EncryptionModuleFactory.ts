import {
  EncryptionModule,
  ModuleBlowfish,
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleWebCryptoAes256,
  ModuleWebCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleNodeCryptoAes128,
  ModuleRC5
} from "./";
import {ModuleTwoFish} from "./ModuleTwoFish";

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

      case ModuleWebCryptoAes128.MODULE_ID:
        return new ModuleWebCryptoAes128();

      case ModuleWebCryptoAes256.MODULE_ID:
        return new ModuleWebCryptoAes256();

      case ModuleNodeCryptoAes128.MODULE_ID:
        return new ModuleNodeCryptoAes128();

      case ModuleNodeCryptoAes256.MODULE_ID:
        return new ModuleNodeCryptoAes256();

      case ModuleBlowfish.MODULE_ID:
        return new ModuleBlowfish();

      case ModuleTwoFish.MODULE_ID:
        return new ModuleTwoFish();

      case ModuleRC5.MODULE_ID:
        return new ModuleRC5();

      case ModuleClearText.MODULE_ID:
        return new ModuleClearText();

      default:
        throw new Error("Unknown module id: " + moduleId);
    }
  }
}