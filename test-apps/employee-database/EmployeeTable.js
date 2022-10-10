export default {
  props: ["db"],
  data: () => {
    return {
      employees: []
    };
  },
  created: function () {

  },
  mounted() {
    const tx = this.db.transaction("employees");
    const objectStore = tx.objectStore("employees");
    const getReq = objectStore.getAll();
    getReq.onsuccess = () => {
      this.employees = getReq.result;
    }

    getReq.onerror = (e) => {
      console.log(getReq.error);
    }

  },
  methods: {},
  template: `
    <nav class="navbar navbar-default">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand"><i class="fa-solid fa-user"/>Employees</a>
        </div>
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <form class="navbar-form navbar-left">
            <div class="form-group">
              <input type="text" class="form-control" placeholder="Low Id">
            </div>
            <div class="form-group">
              <input type="text" class="form-control" placeholder="High Id">
            </div>
            <button type="submit" class="btn btn-default">Filter Employees</button>
          </form>
          <ul class="nav navbar-nav navbar-right">
           <li>
             <router-link to="/create-employee/"><button>Add Employee</button></router-link>
           </li>
          </ul>
        </div>
      </div>
    </nav>
    <table class="table employee-table">
    <thead>
    <tr>
      <th>Employee Id</th>
      <th>First Name </th>
      <th>Last Name</th>
      <th>Social Security</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(employee) in employees">
      <td><router-link :to="'/employees/' + employee.id">{{ employee.id }}</router-link></td>
      <td>{{ employee.firstName }}</td>
      <td>{{ employee.lastName }}</td>
      <td>{{ employee.ssn }}</td>
      <td>{{ employee.email }}</td>
      <td>
        <router-link :to="'/employees/' + employee.id">
          <i class="fa-solid fa-user-edit"></i>  
        </router-link>
        <i class="fa-solid fa-trash"></i>
      </td>
    </tr>
    </tbody>
    </table>
  `
};
