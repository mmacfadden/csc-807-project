import defaultData from "./default_data.js";
import Loading from "./Loading.js";
import LoginForm from "./LoginForm.js";
import {AuthenticationManager} from "./AuthenticationManager.js";

const {EIDBFactory} = EncryptedIndexedDB;

export default  {
    data() {
        return {
            indexedDb: null,
            db: null,
            authManager: new AuthenticationManager(),
            user: null
        }
    },
    created() {
        // TODO we should actually name show the app
        // until this is done.
      this.authManager
          .init()
          .then(() => {
              if (this.authManager.isAuthenticated()) {
                  this.onLogin();
              }
          })
          .catch(e => console.error(e));
    },
    methods: {
        onLogin() {
            console.log("User Logged In");
            this.user = this.authManager.getLoggedInUserName();

            this.indexedDb = new EIDBFactory(window.indexedDB, this.authManager.getEncryptionConfig());

            const req = this.indexedDb.open("employees", 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                const store =  db.createObjectStore("employees", {keyPath: "id"});
                defaultData.forEach(e => {
                    store.add(e);
                })
                console.log("Indexed Database schema installed.");
            }

            req.onsuccess = () => {
                this.db = req.result;
                console.log("Indexed Database open successfully");
            }
        },
        logout() {
            this.authManager.logout();
            this.user = null;
            this.db = null;
            this.indexedDb = null;
        }
    },
    components: {
        Loading,
        LoginForm
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
          <li class="nav-item">
            <a class="nav-link" href="#" @click="logout"><i class="fa-solid fa-power-off" /></a>
          </li>
        </ul>
      </div>
      </nav>
      <router-view v-if="db && user" :db="db"></router-view>
      <loading v-if="user && !db"/>
      <login-form v-if="!user" @login="onLogin" :auth-manager="authManager"/>
    `
};