const {EncryptionConfigManager, ModuleCryptoJsAes256} = EncryptedIndexedDB;

export class AuthenticationManager {

    static _DEMO_USERNAME = "user";
    static _DEMO_PASSWORD = "password";
    static _CREDENTIALS_KEY = "__indexed_db_demo_credentials__";
    static _SESSION_ENCRYPTION_CONFIG = "__indexed_db_encryption_config__";
    static _SESSION_USERNAME = "__demo_username__";

    constructor() {
        this._loggedInUser = null;
        this._encryptionConfigManager = new EncryptionConfigManager(window.localStorage);
        this._encryptionConfig = null;
    }

    async validateCredentials(username, password) {
        const credentials = await this._createCredentials(username, password);
        const storedCredentials = localStorage.getItem(AuthenticationManager._CREDENTIALS_KEY);

        const valid =  credentials === storedCredentials;

        if (valid) {
            if (!this._encryptionConfigManager.configSet()) {
                const encryptionConfig = EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID);
                this._encryptionConfigManager.setConfig(encryptionConfig, password);
            }

            this._encryptionConfig = this._encryptionConfigManager.getConfig(password);
            this._loggedInUser = username;

            sessionStorage.setItem(AuthenticationManager._SESSION_ENCRYPTION_CONFIG, JSON.stringify(this._encryptionConfig))
            sessionStorage.setItem(AuthenticationManager._SESSION_USERNAME, username);
        }

        return valid;
    }

    logout() {
        this._loggedInUser = null;
        this._encryptionConfig = null;
        sessionStorage.clear();
    }

    isAuthenticated() {
        return this._loggedInUser !== null;
    }

    getLoggedInUserName() {
        return this._loggedInUser;
    }

    getEncryptionConfig() {
        return this._encryptionConfig;
    }

    async init() {
        if (!localStorage.getItem(AuthenticationManager._CREDENTIALS_KEY)) {
            const credentials = await this._createCredentials(
                AuthenticationManager._DEMO_USERNAME,
                AuthenticationManager._DEMO_PASSWORD
            );
            localStorage.setItem(AuthenticationManager._CREDENTIALS_KEY, credentials);
        }

        this._loggedInUser = sessionStorage.getItem(AuthenticationManager._SESSION_USERNAME);
        const config = sessionStorage.getItem(AuthenticationManager._SESSION_ENCRYPTION_CONFIG);
        if(config) {
            this._encryptionConfig = JSON.parse(config);
        }
    }

    async _createCredentials(username, password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const passwordHash = await crypto.subtle.digest('SHA-256', data);
        const u8 = new Uint8Array(passwordHash);
        const decoder = new TextDecoder();
        const decoded = decoder.decode(u8);
        const base64Hash = btoa(unescape(encodeURIComponent(decoded)));

        return `${username}:${base64Hash}`
    }
}