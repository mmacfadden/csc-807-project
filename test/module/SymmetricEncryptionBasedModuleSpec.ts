import {expect} from 'chai';
import {SerializationScheme, SymmetricEncryptionBasedModule} from "../../src/module/SymmetricEncryptionBasedModule";

class TestModule extends SymmetricEncryptionBasedModule {
  constructor(moduleId: string) {
    super(moduleId);
  }
  protected _decryptSerializedDocument(ciphertext: Uint8Array): Uint8Array {
    return new Uint8Array();
  }

  protected _encryptSerializedDocument(plaintext: Uint8Array): Uint8Array {
    return new Uint8Array();
  }

  createRandomEncryptionSecret(moduleParams?: any): string {
    return "";
  }
}

describe('SymmetricEncryptionBasedModule', () => {

  describe('init()', () => {
    it('If serialization scheme is not passed, uses the default', () => {
      const module = new TestModule("my id");
      module.init("secret");
      expect(module.serializationScheme()).to.eq(SymmetricEncryptionBasedModule.DEFAULT_SERIALIZATION_SCHEME);
    });

    it('throws on an bad serialization scheme', () => {
      const module = new TestModule("my id");
      expect(() => module.init(
          "key",
          {serializationScheme: "invalid" as SerializationScheme}
      )).to.throw();
    });
  });
});