import {EncryptionModule} from "./EncryptionModule";

/**
 * A baseline module that doesn't encrypt / decrypt data.
 */
export class ModuleClearText extends EncryptionModule {
  public static readonly MODULE_ID = "Clear Text Storage";

  /**
   * Creates a new ModuleClearText instance.
   */
  constructor() {
    super(ModuleClearText.MODULE_ID);
  }

  /**
   * @inheritDoc
   */
  public encrypt(document: any): any {
    return document;
  }

  /**
   * @inheritDoc
   */
  public decrypt(cipherText: any): any {
    return cipherText;
  }

  createRandomEncryptionSecret(): string {
    return "";
  }

  init(encryptionSecret: string): void {
  }
}