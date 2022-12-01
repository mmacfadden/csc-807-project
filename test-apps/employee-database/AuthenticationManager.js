const {EncryptionConfigStorage, ModuleNodeCryptoAes256} = EncryptedIndexedDB;

export class AuthenticationManager {
    static CREDENTIALS_KEY = "_demo_credentials";

    static _DEMO_USERNAME1 = "jim";
    static _DEMO_USERNAME2 = "tim";
    static _DEMO_PASSWORD = "password";

    constructor(storageKeyPrefix) {
        this._loggedInUser = null;
        this._encryptionConfigStorage = null;
        this._encryptionConfig = null;

        this._storageKeyPrefix = storageKeyPrefix || EncryptionConfigStorage.DEFAULT_LOCAL_STORAGE_KEY_PREFIX;
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
            this._encryptionConfigStorage = new EncryptionConfigStorage(
                window.localStorage,
                username,
                window.sessionStorage,
                this._storageKeyPrefix
            );

            this._encryptionConfigStorage.open(password,
                () => EncryptionConfigStorage.generateDefaultConfigData(ModuleNodeCryptoAes256.MODULE_ID));
            this._encryptionConfig = this._encryptionConfigStorage.getConfig();
            this._loggedInUser = username;
        }

        return valid;
    }

    logout() {
        this._loggedInUser = null;
        this._encryptionConfig = null;

        if (this._encryptionConfigStorage) {
            this._encryptionConfigStorage.close();
            EncryptionConfigStorage.clearSession(window.sessionStorage, this._storageKeyPrefix);
        }
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
        this._encryptionConfigStorage.changePassword(currentPassword, newPassword);
        return await this._setCredentials(this._loggedInUser, newPassword);
    }

    async init() {
        const credentialsKey = this._storageKeyPrefix + AuthenticationManager.CREDENTIALS_KEY;
        if (!localStorage.getItem(credentialsKey)) {
            await this._setCredentials(
                AuthenticationManager._DEMO_USERNAME1, AuthenticationManager._DEMO_PASSWORD);

            await this._setCredentials(
                AuthenticationManager._DEMO_USERNAME2, AuthenticationManager._DEMO_PASSWORD);
        }

        this._encryptionConfigStorage = EncryptionConfigStorage.restoreFromSession(
            window.localStorage, window.sessionStorage, this._storageKeyPrefix)

        if (this._encryptionConfigStorage) {
            this._loggedInUser = this._encryptionConfigStorage.username();
            this._encryptionConfig = this._encryptionConfigStorage.getConfig();
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