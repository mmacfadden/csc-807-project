import EmployeeTable from "./EmployeeTable.js";

const ssnRegEx = /(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}/;
const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default {
  props: ["db", "id"],
  data: () => {
    return {
      employeeId: null,
      employee: {},
      toast: null,
      errors: []
    };
  },
  mounted() {
    if (this.id) {
      const tx = this.db.transaction("employees");
      const store = tx.objectStore("employees");
      const req = store.get(this.id);
      req.onsuccess = () => {
        this.employee = req.result;
      };

      req.onerror = () => {
        console.log(req.error);
      }
    }

    this.toast = new bootstrap.Toast(document.getElementById('saveToast'))
  },
  methods: {
    save() {
      if (this.validateForm()) {
        const tx = this.db.transaction("employees", "readwrite");
        const store = tx.objectStore("employees");
        console.log(this.employee);
        let req
        if (this.id){
          req = store.put(this.employee);
        } else {
          req = store.add(this.employee);
        }

        req.onsuccess = () => {
          console.log("employee saved");
          this.$router.replace({ path: '/' })
        };

        req.onerror = () => {
          if (req.error.name === "ConstraintError") {
            this.toast.show();
          }
        };
      }

    },
    validateForm: function () {
      this.errors = [];

      if (!this.employee.id) {
        this.errors.push('The employee id must be set.');
      }

      if (!this.employee.firstName) {
        this.errors.push('First name is required.');
      }

      if (!this.employee.lastName) {
        this.errors.push('Last name is required.');
      }

      if (!this.employee.email) {
        this.errors.push('Email is required.');
      } else if (!emailRegEx.test(this.employee.email)) {
        this.errors.push('Please enter a valid email address.');
      }

      if (!this.employee.ssn) {
        this.errors.push('Social Security Number is required.');
      } else if (!ssnRegEx.test(this.employee.ssn)) {
        this.errors.push('Social Security Number must be of the format 123-45-6789.');
      }

      return this.errors.length === 0;
    }

  },
  components: {
    EmployeeTable
  },
  template: `
    <div class="centered-form">
      <div class="title">
        <i class="fa-solid fa-user"/>
        <span>{{id ? "Edit Employee" : "Create Employee"}}</span>
      </div>
      <div class="form-error" v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </div>
      <form>
        <div class="mb-3">
          <label for="employeeId" class="form-label">Employee Id</label>
          <input type="text" class="form-control" id="employeeId" v-model="this.employee.id" placeholder="Employee Id" :readonly="id !== undefined" :disabled="id !== undefined">
        </div>
        <div class="mb-3">
          <label for="firstName" class="form-label">First Name</label>
          <input type="text" class="form-control" id="firstName" v-model="this.employee.firstName" placeholder=" First Name">
        </div>
        <div class="mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="lastName" v-model="this.employee.lastName" placeholder=" Last Name">
        </div>
        <div class="mb-3">
          <label for="emailAddress" class="form-label">Email address</label>
          <input type="email" class="form-control" id="emailAddress" v-model="this.employee.email" placeholder="Email">
        </div>
        <div class="mb-3">
          <label for="ssn" class="form-label">Social Security Number</label>
          <input type="text" class="form-control" 
                 required="required" minlength="11" maxlength="11" pattern="(?!666|000|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0{4})\\d{4}" id="ssn" v-model="this.employee.ssn" placeholder="Social Security Number">
        </div>
        <div class="buttons">
          <router-link to="/" class="btn btn-secondary">Cancel</router-link>
          <button type="submit" class="btn btn-primary" @click="save">Save</button>
        </div>
      </form>
    </div>
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div id="saveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <i class="fa-solid fa-circle-exclamation"></i>
        <strong class="me-auto">Error</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        An employee with the specified id already exists.
      </div>
    </div>
    </div>
  `
};