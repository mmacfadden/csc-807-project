const {EncryptionConfigManager, ModuleNodeCryptoAes256} = EncryptedIndexedDB;

export class AuthenticationManager {
    static CREDENTIALS_KEY = "_demo_credentials";
    static SESSION_ENCRYPTION_CONFIG = "_encryption_config";
    static SESSION_USERNAME = "_demo_username";

    static _DEMO_USERNAME1 = "user1";
    static _DEMO_USERNAME2 = "user2";
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
        if (!password) {
            return false;
        }

        const credentials = await this._createCredentials(username, password);
        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        const storedCredentialsString = localStorage.getItem(credentialsKey);

        if (!storedCredentialsString) {
            return false;
        }

        const storedCredentials = JSON.parse(storedCredentialsString);
        const storedPassword = storedCredentials[credentials.user];

        const valid = storedCredentials && storedPassword === credentials.pass;

        if (valid) {
            if (!this._encryptionConfigManager.configSet(username)) {
                const encryptionConfig = await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes256.MODULE_ID);
                this._encryptionConfigManager.setConfig(encryptionConfig, username, password);
            }

            this._encryptionConfig = this._encryptionConfigManager.getConfig(username, password);
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

        const sessionStorageUsernameKey = this._storageKeyPrefix + AuthenticationManager.SESSION_USERNAME;
        sessionStorage.removeItem(sessionStorageUsernameKey);

        const sessionStorageConfigKey = this._storageKeyPrefix + AuthenticationManager.SESSION_ENCRYPTION_CONFIG;
        sessionStorage.removeItem(sessionStorageConfigKey);
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
        const sessionStorageUsernameKey = this._storageKeyPrefix + AuthenticationManager.SESSION_USERNAME;
        const username = sessionStorage.getItem(sessionStorageUsernameKey);
        this._encryptionConfigManager.changePassword(username, currentPassword, newPassword);
        return await this._setCredentials(username, newPassword);
    }

    async init() {
        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        if (!localStorage.getItem(credentialsKey)) {
            await this._setCredentials(
                AuthenticationManager._DEMO_USERNAME1, AuthenticationManager._DEMO_PASSWORD);

            await this._setCredentials(
                AuthenticationManager._DEMO_USERNAME2, AuthenticationManager._DEMO_PASSWORD);
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
        if (!username) {
            throw new Error("username must be a non-empty string");
        }

        if (!password) {
            throw new Error("password must be a non-empty string");
        }

        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        let credsString = localStorage.getItem(credentialsKey);
        if (!credsString) {
            credsString = JSON.stringify({});
        }

        const creds = JSON.parse(credsString);

        const {user, pass} = await this._createCredentials(username, password);
        creds[user] = pass;

        localStorage.setItem(credentialsKey, JSON.stringify(creds));
    }

    async _createCredentials(username, password) {
        const encoder = new TextEncoder();

        const userBytes = encoder.encode(username);
        const userHash = await crypto.subtle.digest('SHA-256', userBytes);
        const userHashAsUtf8 = new TextDecoder().decode(new Uint8Array(userHash))
        const userHashBase64 = btoa(unescape(encodeURIComponent(userHashAsUtf8)));

        const passwordBytes = encoder.encode(password);
        const passwordHash = await crypto.subtle.digest('SHA-256', passwordBytes);

        const passwordHashAsUtf8 = new TextDecoder().decode(new Uint8Array(passwordHash))
        const passwordHashBase64 = btoa(unescape(encodeURIComponent(passwordHashAsUtf8)));

        return {user: userHashBase64, pass: passwordHashBase64};
    }
}