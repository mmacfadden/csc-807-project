import {expect} from 'chai';
import sinon from "sinon";
import "fake-indexeddb/auto";
import {IDBFactory} from "fake-indexeddb";
import {EIDBFactory, EncryptionConfig, EncryptionConfigStorage, ModuleClearText, RequestUtils} from "../../src";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";


chai.should();
chai.use(chaiAsPromised);

describe('EIDBFactory', () => {

  describe('constructor', () => {
    it( "throws if the delegate is not set", () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      expect(() => new EIDBFactory(null as any as IDBFactory, config)).to.throw();
    });

    it( "throws if the config is not set", () => {
      expect(() => new EIDBFactory(new IDBFactory(), null as any as EncryptionConfig)).to.throw();
    });

    it( "sets the correct module", () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      expect(factory.encryptionModuleId()).to.eq(config.moduleId());
    });
  });

  describe('databases', () => {
    it( "is empty on construction", () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const dbs = factory.databases();
      return dbs.should.eventually.deep.eq([]);
    });

    it( "return a database that was created", async () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const db = await RequestUtils.toPromise(factory.open("name", 1))
      db.close();
      const dbs = factory.databases();
      return dbs.should.eventually.deep.eq([{ name: 'name', version: 1 }]);
    });
  });

  describe('deleteDatabase', () => {
    it( "return a database that was created", async () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const db = await RequestUtils.toPromise(factory.open("name", 1))
      db.close();

      await factory.databases()
          .should.eventually.deep.eq([{ name: 'name', version: 1 }]);

      await RequestUtils.toPromise(factory.deleteDatabase("name"));

      return factory.databases()
          .should.eventually.deep.eq([]);
    });
  });

  describe('cmp', () => {
    it( "returns less than zero if a < b", async () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      expect(factory.cmp("a", "b")).to.be.lessThan(0);
    });

    it( "returns greater than zero if a > b", async () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      expect(factory.cmp("b", "a")).to.be.greaterThan(0);
    });

    it( "returns zero if a == b", async () => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      expect(factory.cmp("a", "a")).to.equal(0);
    });
  });

});