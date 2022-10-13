const {EncryptionConfigManager, ModuleCryptoJsAes256} = EncryptedIndexedDB;

export class AuthenticationManager {
    static CREDENTIALS_KEY = "_demo_credentials";
    static SESSION_ENCRYPTION_CONFIG = "_encryption_config";
    static SESSION_USERNAME = "_demo_username";

    static _DEMO_USERNAME = "user";
    static _DEMO_PASSWORD = "password";

    constructor(storageKeyPrefix) {
        this._loggedInUser = null;
        this._encryptionConfigManager = new EncryptionConfigManager(window.localStorage);
        this._encryptionConfig = null;

        if (storageKeyPrefix) {
            this._storageKeyPrefix = storageKeyPrefix;
        } else {
            this._storageKeyPrefix = EncryptionConfigManager.DEFAULT_LOCAL_STORAGE_KEY_PREFIX;
        }
    }

    async validateCredentials(username, password) {
        const credentials = await this._createCredentials(username, password);
        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        const storedCredentials = localStorage.getItem(credentialsKey);

        const valid = credentials === storedCredentials;

        if (valid) {
            if (!this._encryptionConfigManager.configSet()) {
                const encryptionConfig = EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID);
                this._encryptionConfigManager.setConfig(encryptionConfig, password);
            }

            this._encryptionConfig = this._encryptionConfigManager.getConfig(password);
            this._loggedInUser = username;

            const sessionStorageConfigKey = this._storageKeyPrefix + AuthenticationManager.SESSION_ENCRYPTION_CONFIG;
            sessionStorage.setItem(sessionStorageConfigKey, JSON.stringify(this._encryptionConfig));

            const sessionStorageUsernameKey = this._storageKeyPrefix + AuthenticationManager.SESSION_USERNAME;
            sessionStorage.setItem(sessionStorageUsernameKey, username);
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

    async changePassword(currentPassword, newPassword) {
        this._encryptionConfigManager.changePassword(currentPassword, newPassword);
        await this._setCredentials(AuthenticationManager._DEMO_USERNAME, newPassword);
    }

    async init() {
        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        if (!localStorage.getItem(credentialsKey)) {
            await this._setCredentials(
                AuthenticationManager._DEMO_USERNAME, AuthenticationManager._DEMO_PASSWORD);
        }

        const usernameKey = this._storageKeyPrefix + AuthenticationManager.SESSION_USERNAME;
        const encryptionConfigKey = this._storageKeyPrefix + AuthenticationManager.SESSION_ENCRYPTION_CONFIG;
        this._loggedInUser = sessionStorage.getItem(usernameKey);
        const config = sessionStorage.getItem(encryptionConfigKey);
        if (config) {
            this._encryptionConfig = JSON.parse(config);
        }
    }

    async _setCredentials(username, password) {
        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        const credentials = await this._createCredentials(username, password);
        localStorage.setItem(credentialsKey, credentials);
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