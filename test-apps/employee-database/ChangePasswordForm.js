export default {
  props: ["authManager"],
  data: () => {
    return {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      errors: []
    };
  },
  methods: {
    async changePassword() {
      const valid = await this.validateForm();
      if (valid) {
        await this.authManager.changePassword(this.currentPassword, this.newPassword);
        this.$router.replace({ path: '/' });
      }
    },
    async validateForm() {
      this.errors = [];

      if (!this.currentPassword) {
        this.errors.push('The current password must be set');
      }

      if (!this.newPassword || this.newPassword.length < 5) {
        this.errors.push('The new password must be at least 5 characters.');
      }

      if (this.confirmPassword !== this.newPassword) {
        this.errors.push('The passwords do not match');
      }

      if (this.errors.length === 0) {
        return this.authManager
            .validateCredentials(this.authManager.getLoggedInUserName(), this.currentPassword)
            .then(success => {
              if (!success) {
                this.errors.push("The current password was incorrect.");
              }
              return success;
            });
      } else {
        return false;
      }
    }
  },
  template: `
    <div class="centered-form">
      <div class="title">
        <i class="fa-solid fa-lock"/>
        <span>Change Password</span>
      </div>
      <div class="form-error" v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </div>
      <form>
        <input type="text" hidden="hidden" id="username" value="{{this.authManager.getLoggedInUserName()}}" 
               autocomplete="username"/>
        <div class="mb-3">
          <label for="currentPassword" class="form-label">Current Password</label>
          <input type="password" class="form-control" id="currentPassword" v-model="this.currentPassword" 
                 placeholder="Current Password" autocomplete="current-password">
        </div>
        <div class="mb-3">
          <label for="newPassword" class="form-label">New Password</label>
          <input type="password" class="form-control" id="newPassword" v-model="this.newPassword" 
                 placeholder="New Password" autocomplete="new-password">
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" class="form-control" id="confirmPassword" v-model="this.confirmPassword" 
                 placeholder="Confirm Password" autocomplete="new-password">
        </div>
        <div class="buttons">
          <router-link to="/" class="btn btn-secondary">Cancel</router-link>
          <button type="submit" class="btn btn-primary" @click="changePassword">Change Password</button>
        </div>
      </form>
    </div>
  `
};