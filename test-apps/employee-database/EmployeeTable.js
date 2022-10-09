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
      console.log("success", getReq.result)
      this.employees = getReq.result;
    }

    getReq.onerror = (e) => {
      console.log(getReq.error);
    }

  },
  methods: {},
  template: `
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
      <td>{{ employee.id }}</td>
      <td>{{ employee.firstName }}</td>
      <td>{{ employee.lastName }}</td>
      <td>{{ employee.ssn }}</td>
      <td>{{ employee.email }}</td>
      <td>
        <i class="fa-solid fa-user-edit"></i>
        <i class="fa-solid fa-trash"></i>
      </td>
    </tr>
    </tbody>
    </table>
  `
};
