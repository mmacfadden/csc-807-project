import EmployeeTable from "./EmployeeTable.js";

export default {
  props: ["db", "id"],
  data: () => {
    return {
      employeeId: null,
      employee: {},
      toast: null
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
  components: {
    EmployeeTable
  },
  template: `
    <div class="employee-form">
      <div class="title">
        <i class="fa-solid fa-user"/>
        <span>{{id ? "Edit Employee" : "Create Employee"}}</span>
      </div>
      <form>
        <div class="mb-3">
          <label for="employeeId">Employee Id</label>
          <input type="text" class="form-control" id="employeeId" v-model="this.employee.id" placeholder="Employee Id" :readonly="id !== undefined" :disabled="id !== undefined">
        </div>
        <div class="mb-3">
          <label for="firstName">First Name</label>
          <input type="text" class="form-control" id="firstName" v-model="this.employee.firstName" placeholder=" First Name">
        </div>
        <div class="mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="lastName" v-model="this.employee.lastName" placeholder=" Last Name">
        </div>
        <div class="mb-3">
          <label for="emailAddress">Email address</label>
          <input type="email" class="form-control" id="emailAddress" v-model="this.employee.email" placeholder="Email">
        </div>
        <div class="mb-3">
          <label for="ssn">Social Security Number</label>
          <input type="text" class="form-control" id="ssn" v-model="this.employee.ssn" placeholder="Social Security Number">
        </div>
        <div class="buttons">
          <router-link to="/" class="btn btn-default">Cancel</router-link>
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
