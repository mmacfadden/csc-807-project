import {expect} from 'chai';
import {
  EncryptionModuleFactory,
  ModuleBlowfish,
  ModuleChaCha20,
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleNodeCryptoChaCha20,
  ModuleRC5,
  ModuleSM4CBC,
  ModuleTwoFish,
  ModuleXSalsa20NaCl
} from '../../src';

describe('EncryptionModuleFactory', () => {

  describe('createModule', () => {
    it('throws on an unknown moduleId', () => {
      expect(() => EncryptionModuleFactory.createModule("unknown")).to.throw();
    });

    it(ModuleCryptoJsAes256.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleCryptoJsAes256.MODULE_ID);
      expect(module instanceof ModuleCryptoJsAes256).to.be.true;
      expect(module.moduleId()).to.eq(ModuleCryptoJsAes256.MODULE_ID);
    });

    it(ModuleCryptoJsAes128.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleCryptoJsAes128.MODULE_ID);
      expect(module instanceof ModuleCryptoJsAes128).to.be.true;
      expect(module.moduleId()).to.eq(ModuleCryptoJsAes128.MODULE_ID);
    });

    it(ModuleCryptoJsTripleDes.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleCryptoJsTripleDes.MODULE_ID);
      expect(module instanceof ModuleCryptoJsTripleDes).to.be.true;
      expect(module.moduleId()).to.eq(ModuleCryptoJsTripleDes.MODULE_ID);
    });

    it(ModuleNodeCryptoAes256.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleNodeCryptoAes256.MODULE_ID);
      expect(module instanceof ModuleNodeCryptoAes256).to.be.true;
      expect(module.moduleId()).to.eq(ModuleNodeCryptoAes256.MODULE_ID);
    });

    it(ModuleNodeCryptoAes128.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleNodeCryptoAes128.MODULE_ID);
      expect(module instanceof ModuleNodeCryptoAes128).to.be.true;
      expect(module.moduleId()).to.eq(ModuleNodeCryptoAes128.MODULE_ID);
    });

    it(ModuleRC5.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleRC5.MODULE_ID);
      expect(module instanceof ModuleRC5).to.be.true;
      expect(module.moduleId()).to.eq(ModuleRC5.MODULE_ID);
    });

    it(ModuleNodeCryptoChaCha20.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleNodeCryptoChaCha20.MODULE_ID);
      expect(module instanceof ModuleNodeCryptoChaCha20).to.be.true;
      expect(module.moduleId()).to.eq(ModuleNodeCryptoChaCha20.MODULE_ID);
    });

    it(ModuleXSalsa20NaCl.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleXSalsa20NaCl.MODULE_ID);
      expect(module instanceof ModuleXSalsa20NaCl).to.be.true;
      expect(module.moduleId()).to.eq(ModuleXSalsa20NaCl.MODULE_ID);
    });

    it(ModuleChaCha20.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleChaCha20.MODULE_ID);
      expect(module instanceof ModuleChaCha20).to.be.true;
      expect(module.moduleId()).to.eq(ModuleChaCha20.MODULE_ID);
    });

    it(ModuleSM4CBC.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleSM4CBC.MODULE_ID);
      expect(module instanceof ModuleSM4CBC).to.be.true;
      expect(module.moduleId()).to.eq(ModuleSM4CBC.MODULE_ID);
    });

    it(ModuleBlowfish.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleBlowfish.MODULE_ID);
      expect(module instanceof ModuleBlowfish).to.be.true;
      expect(module.moduleId()).to.eq(ModuleBlowfish.MODULE_ID);
    });

    it(ModuleTwoFish.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleTwoFish.MODULE_ID);
      expect(module instanceof ModuleTwoFish).to.be.true;
      expect(module.moduleId()).to.eq(ModuleTwoFish.MODULE_ID);
    });

    it(ModuleClearText.MODULE_ID, () => {
      const module = EncryptionModuleFactory.createModule(ModuleClearText.MODULE_ID);
      expect(module instanceof ModuleClearText).to.be.true;
      expect(module.moduleId()).to.eq(ModuleClearText.MODULE_ID);
    });
  });
});