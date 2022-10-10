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

  },
  components: {
    EmployeeTable
  },
  template: `
    <div class="employee-form">
      <h1>{{id ? "Edit Employee" : "Create Employee"}}</h1>
      <form>
        <div class="form-group">
          <label for="employeeId">Employee Id</label>
          <input type="text" class="form-control" id="employeeId" :value="this.employee.id" placeholder="Employee Id" :readonly="id !== undefined">
        </div>
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" class="form-control" id="firstName" :value="this.employee.firstName" placeholder=" First Name">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" class="form-control" id="lastName" :value="this.employee.lastName" placeholder=" Last Name">
        </div>
        <div class="form-group">
          <label for="emailAddress">Email address</label>
          <input type="email" class="form-control" id="emailAddress" :value="this.employee.email" placeholder="Email">
        </div>
        <div class="form-group">
          <label for="emailAddress">Social Security Number</label>
          <input type="email" class="form-control" id="emailAddress" :value="this.employee.ssn" placeholder="Email">
        </div>
        <div class="buttons">
          <router-link to="/" class="btn btn-default">Cancel</router-link>
          <button type="submit" class="btn btn-default">Submit</button>
        </div>
      </form>
    </div>
  `
};
