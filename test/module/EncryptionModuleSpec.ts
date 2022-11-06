import {expect} from 'chai';
import {EncryptionModule} from '../../src';

class TestModule extends EncryptionModule {
  constructor(moduleId: string) {
    super(moduleId);
  }

  createRandomEncryptionSecret(moduleParams?: any): string {
    return "";
  }

  decrypt(cipherText: any): any {
  }

  encrypt(document: any): any {
  }

  init(encryptionSecret: string, moduleParams?: any): void {
  }
}

describe('EncryptionModule', () => {
  describe('constructor()', () => {
    it('If serialization scheme is not passed, uses the default', () => {
      const id = "test id";
      const module = new TestModule(id);
      expect(module.moduleId()).to.eq(id);
    });
  })
});