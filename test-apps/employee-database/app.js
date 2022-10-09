import Employees from './Employees.js'
import About from './About.js'
import NotFound from "./NotFound.js";
import Loading from "./Loading.js";
import EmployeeForm from "./EmployeeForm.js";
import defaultData from "./default_data.js";

const {EIDBFactory, EncryptionConfigManager, ModuleCryptoJsAes256} = EncryptedIndexedDB;

const password = "mypassword";

const encryptionConfigManager = new EncryptionConfigManager(window.localStorage);

if (!encryptionConfigManager.configSet()) {
    const encryptionConfig = EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID);
    encryptionConfigManager.setConfig(encryptionConfig, password);
}

const encryptionConfig = encryptionConfigManager.getConfig(password);

const indexedDb = new EIDBFactory(window.indexedDB, encryptionConfig);

const routes = {
    '/': Employees,
    '/about': About,
    '/employee': EmployeeForm
}

export default  {
    data() {
        return {
            currentPath: window.location.hash,
            user: null,
            indexedDb: indexedDb,
            db: null,
        }
    },
    computed: {
        currentView() {
            if (!this.db) {
                return Loading;
            } else {
                return routes[this.currentPath.slice(1) || '/'] || NotFound
            }
        }
    },
    mounted() {
        const req = this.$data.indexedDb.open("employees", 1);
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

        window.addEventListener('hashchange', () => {
            this.currentPath = window.location.hash
        })
    },
    template: `
      <nav class="navbar navbar-default header">
        <div class="nav-wrapper">
          <a href="#" class="brand-logo">
            <img src="images/logo.png">
            <span>Encrypted IndexedDB Demo</span>
          </a>
          <ul id="nav-mobile" class="nav nav-pills">
            <li><a href="#/">Home</a></li>
            <li><a href="#/about">About</a></li>
            <li><a target="_blank" href="https://github.com/mmacfadden/csc-807-project">GitHub</a></li>
          </ul>
        </div>
      </nav>
      <component :is="currentView" />
    `
}