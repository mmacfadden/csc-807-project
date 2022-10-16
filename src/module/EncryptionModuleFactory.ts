import {IEncryptionConfig} from "../config";
import {
  EncryptionModule,
  ModuleBlowfish,
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleTripleSec,
  ModuleWebCryptoAes256,
  ModuleWebCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleNodeCryptoAes128
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
   * @param config
   *   The configuration which determines which type of module to create.
   *
   * @returns The created module of the correct type.
   *
   * @throws If the config.moduleId is not recognized.
   */
  public static createModule(config: IEncryptionConfig): EncryptionModule {
    switch (config.moduleId) {
      case ModuleCryptoJsAes256.MODULE_ID:
        return new ModuleCryptoJsAes256(config.dataSecret);

      case ModuleCryptoJsAes128.MODULE_ID:
        return new ModuleCryptoJsAes128(config.dataSecret);

      case ModuleCryptoJsTripleDes.MODULE_ID:
        return new ModuleCryptoJsTripleDes(config.dataSecret);

      case ModuleTripleSec.MODULE_ID:
        return new ModuleTripleSec(config.dataSecret);

      case ModuleWebCryptoAes128.MODULE_ID:
        return new ModuleWebCryptoAes128(config.dataSecret);

      case ModuleWebCryptoAes256.MODULE_ID:
        return new ModuleWebCryptoAes256(config.dataSecret);

      case ModuleNodeCryptoAes128.MODULE_ID:
        return new ModuleNodeCryptoAes128(config.dataSecret);

      case ModuleNodeCryptoAes256.MODULE_ID:
        return new ModuleNodeCryptoAes256(config.dataSecret);

      case ModuleBlowfish.MODULE_ID:
        return new ModuleBlowfish(config.dataSecret);

      case ModuleTwoFish.MODULE_ID:
        return new ModuleTwoFish(config.dataSecret);

      case ModuleClearText.MODULE_ID:
        return new ModuleClearText();



      default:
        throw new Error("Unknown module id: " + config.moduleId);
    }
  }
}