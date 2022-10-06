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
  ModuleWebCryptoAes256SaltedKey, ModuleWebCryptoAes128, ModuleNodeWebCryptoAes128, ModuleNodeWebCryptoAes256
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
        return new ModuleCryptoJsAes256(config.secret);

      case ModuleCryptoJsAes128.MODULE_ID:
        return new ModuleCryptoJsAes128(config.secret);

      case ModuleCryptoJsTripleDes.MODULE_ID:
        return new ModuleCryptoJsTripleDes(config.secret);

      case ModuleTripleSec.MODULE_ID:
        return new ModuleTripleSec(config.secret);

      case ModuleWebCryptoAes256SaltedKey.MODULE_ID:
        return new ModuleWebCryptoAes256SaltedKey(config.secret);

      case ModuleWebCryptoAes128.MODULE_ID:
        return new ModuleWebCryptoAes128(config.secret);

      case ModuleWebCryptoAes256.MODULE_ID:
        return new ModuleWebCryptoAes256(config.secret);

        case ModuleNodeWebCryptoAes128.MODULE_ID:
        return new ModuleNodeWebCryptoAes128(config.secret);

      case ModuleNodeWebCryptoAes256.MODULE_ID:
        return new ModuleNodeWebCryptoAes256(config.secret);

      case ModuleBlowfish.MODULE_ID:
        return new ModuleBlowfish(config.secret);

      case ModuleTwoFish.MODULE_ID:
        return new ModuleTwoFish(config.secret);

      case ModuleClearText.MODULE_ID:
        return new ModuleClearText();

      default:
        throw new Error("Unknown module id: " + config.moduleId);
    }
  }
}