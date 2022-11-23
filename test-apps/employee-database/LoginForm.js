export default {
  props: ['authManager'],
  emits: ['login', 'error'],
  data: () => {
    return {
      error: "",
      username: "",
      password: ""
    };
  },
  mounted() {
    document.getElementById("username").focus();
  },
  methods: {
    login() {
      this.authManager
          .validateCredentials(this.username, this.password)
          .then(valid => {
            if (valid) {
              this.error = "";
              this.$emit("login");
            } else {
              this.error = "Invalid credentials"
            }
          })
          .catch(e => {
            this.$emit("error", e.message);
            console.log(e);
          });
    }
  },
  template: `
    <div class="centered-form">
      <div class="title">
        <i class="fa-solid fa-lock"/>
        <span>Login</span>
      </div>
      <form>
        <div class="description-box">
          You may log in to this demo application as one of the following two users:
          <ul>
            <li><strong>john</strong> : password </li>
            <li><strong>matt</strong> : password</li>
          </ul>
          <i>Note: You may change the password for the users, but the new passwords will not be shown here.</i>
        </div>
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" v-model="username" class="form-control" id="username" autocomplete="username" autofocus>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" v-model="password" class="form-control" id="password" autocomplete="current-password">
        </div>
        <div class="form-error" v-if="error">{{error}}</div>
        <div class="buttons">
          <button type="submit" class="btn btn-primary" @click="login">Login</button>  
        </div>
      </form>
    </div>
  `
};
