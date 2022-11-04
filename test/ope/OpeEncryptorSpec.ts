import {OpeEncryptor} from "../../src/ope/OpeEncryptor";
import CryptoJS from "crypto-js";
import {expect} from 'chai';
import {OPE} from "../../src/ope/OPE";

describe('OpeEncryptor', () => {
  describe('generateKey', () => {
    it('Omitting the block size should generate a key with the default size.', () => {
      const key = OpeEncryptor.generateKey();
      const wordArray = CryptoJS.enc.Base64.parse(key);
      expect(wordArray.sigBytes).to.eq(OpeEncryptor.DEFAULT_KEY_BLOCK_SIZE);
    });

    it('Generate key with specified size.', () => {
      const key = OpeEncryptor.generateKey(40);
      const wordArray = CryptoJS.enc.Base64.parse(key);
      expect(wordArray.sigBytes).to.eq(40);
    });

    it('Throw if block_size is less than 24', () => {
      expect(() => {
        OpeEncryptor.generateKey(10)
      }).to.throw();
    });
  });

  describe('constructor', () => {
    it('Throw if key is not defined', () => {
      expect(() => {
        new OpeEncryptor(undefined as any as string);
      }).to.throw();
    });

    it('Throw if key is an empty string', () => {
      expect(() => {
        new OpeEncryptor("");
      }).to.throw();
    });
  });

  describe('encryptString', () => {
    it('Encrypt and decrypt a string', () => {
      const key = OpeEncryptor.generateKey();
      const encryptor = new OpeEncryptor(key);
      const plainText = "My String Value";
      const cipherText = encryptor.encryptString(plainText);
      expect(cipherText).to.not.be.undefined;

      const decrypted = encryptor.decryptString(cipherText);
      expect(decrypted).to.eq(plainText);
    });
  });

  describe('encryptNumber', () => {
    it('Encrypt and decrypt a string', () => {
      const key = OpeEncryptor.generateKey();
      const encryptor = new OpeEncryptor(key);
      const plainText = 10;
      const cipherText = encryptor.encryptNumber(plainText);
      expect(cipherText).to.not.be.undefined;

      const decrypted = encryptor.decryptNumber(cipherText);
      expect(decrypted).to.eq(plainText);
    });
  });
});