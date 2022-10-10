import EmployeeTable from "./EmployeeTable.js";

export default {
  props: ["db", "id"],
  data: () => {
    return {
      employeeId: null,
      employee: {}
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
  },
  methods: {
    save() {
      const tx = this.db.transaction("employees", "readwrite");
      const store = tx.objectStore("employees");
      console.log(this.employee);
      const req = store.put(this.employee);
      req.onsuccess = () => {
        console.log("employee saved");
      };

      this.$router.replace({ path: '/' })
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
  `
};
