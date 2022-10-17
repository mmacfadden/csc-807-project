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
  public async encrypt(document: any): Promise<any> {
    return document;
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cipherText: any): Promise<any> {
    return cipherText;
  }

  createRandomEncryptionSecret(): Promise<string> {
    return Promise.resolve("");
  }

  init(encryptionSecret: string): Promise<void> {
    return Promise.resolve(undefined);
  }
}