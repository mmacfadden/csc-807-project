import defaultData from "./default_data.js";
import Loading from "./Loading.js";

const {EIDBFactory, EncryptionConfigManager, ModuleCryptoJsAes256} = EncryptedIndexedDB;

const password = "mypassword";

const encryptionConfigManager = new EncryptionConfigManager(window.localStorage);

if (!encryptionConfigManager.configSet()) {
    const encryptionConfig = EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID);
    encryptionConfigManager.setConfig(encryptionConfig, password);
}

const encryptionConfig = encryptionConfigManager.getConfig(password);

console.log(encryptionConfig);

const indexedDb = new EIDBFactory(window.indexedDB, encryptionConfig);

export default  {
    data() {
        return {
            user: null,
            indexedDb: indexedDb,
            db: null,
        }
    },
    mounted() {
        const req = this.indexedDb.open("employees", 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            const store =  db.createObjectStore("employees", {keyPath: "id"});
            defaultData.forEach(e => {
                store.add(e);
            })
            console.log("Updated Schema");
        }

        req.onsuccess = () => {
            const db = req.result;
            this.db = db;
            console.log("Database open");
        }
    },
    components: {
        Loading
    },
    template: `
      <nav class="navbar navbar-expand-lg bg-light">
      <div class="container-fluid">
        <span class="brand-logo">
          <i class="fa-brands fa-html5"/>
          <i class="fa-solid fa-database"/>
          <span>Encrypted IndexedDB Demo</span>
        </span>
        <div class="flex-fill"></div>
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">About</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" target="_blank" href="https://github.com/mmacfadden/csc-807-project">GitHub</a>
          </li>
        </ul>
      </div>
      </nav>
      <router-view v-if="db" :db="db"></router-view>
      <loading v-if="!db"/>
    `
};