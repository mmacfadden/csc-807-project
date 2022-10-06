import {EncryptionModule} from "./EncryptionModule";

/**
 * An abstract base class for symmetric key encryption.
 */
export abstract class SymmetricEncryptionBasedModule extends EncryptionModule {
  /**
   * The symmetric encryption key.
   */
  protected readonly _encryptionSecret: string;

  /**
   * Creates a new module.
   *
   * @param moduleId
   *   The unique module id for this type of encryption module.
   * @param secret
   *   The encryption secret to use for symmetric encryption.
   */
  protected constructor(moduleId: string, secret: string) {
    super(moduleId);
    this._encryptionSecret = secret;
  }
}
