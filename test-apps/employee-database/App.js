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
            user: null,
            initialized: false,
            toast: null,
            error: ""
        }
    },
    created() {
        // TODO we should actually name show the app
        //  until this is done.
      this.authManager
          .init()
          .then(() => {
              this.initialized = true;
              if (this.authManager.isAuthenticated()) {
                  return this.onLogin();
              }
          })
          .catch(e => {
              this.$emit('error', e.message);
              console.log(e);
          });
    },
    mounted() {
        const toastElement = document.getElementById('toast');
        this.toast = new bootstrap.Toast(toastElement);
    },
    methods: {
        async onLogin() {
            console.log("User Logged In");
            this.user = this.authManager.getLoggedInUserName();

            this.indexedDb = new EIDBFactory(window.indexedDB, this.authManager.getEncryptionConfig());
            this.indexedDb.initEncryption();

            const req = this.indexedDb.open("employees", 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                const store =  db.createObjectStore("employees", {keyPath: "id"});
                defaultData.forEach(e => {
                    const req = store.add(e);
                    req.onerror = () => {
                        console.error(req.error);
                    }
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
        },
        onError(msg) {
            console.log("error event")
            this.error = msg;
            this.toast.show();
        }
    },
    components: {
        Loading,
        LoginForm
    },
    template: `
      <nav class="navbar navbar-dark navbar-expand-lg bg-dark">
      <div class="container-fluid">
        <span class="navbar-brand brand-logo">
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
          <li v-if="user" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-user" />
            </a>
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-start">
              <li><router-link class="dropdown-item" to="/change-password/"><i class="fa-solid fa-lock" /> Change Password</router-link></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click="logout"><i class="fa-solid fa-power-off" /> Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
      </nav>
      <loading v-if="!initialized || (user && !db)"/>
      <login-form v-if="initialized && !user" @login="onLogin" @error="onError" :auth-manager="authManager" />
      <router-view v-if="initialized && db && user" :db="db" :auth-manager="authManager" @error="onError"></router-view>
      <div class="toast" id="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <i class="fa-solid fa-exclamation-circle" />
        <strong class="me-auto">Error</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">{{ this.error }}</div>
      </div>
    `
};