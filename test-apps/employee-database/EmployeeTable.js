export default {
  props: ["db"],
  data: () => {
    return {
      employees: [],
      filter: {
        lowerBound: "",
        upperBound: ""
      },
      deleteModal: null,
      idToDelete: null
    };
  },
  mounted() {
    this.loadEmployees();
    this.deleteModal = new bootstrap.Modal('#delete-modal');
  },
  methods: {
    loadEmployees() {

      const tx = this.db.transaction("employees");
      const objectStore = tx.objectStore("employees");
      let range = undefined;
      if (this.filter.lowerBound !== "" && this.filter.upperBound === "") {
        range = IDBKeyRange.lowerBound(this.filter.lowerBound);
      } else if (this.filter.lowerBound === "" && this.filter.upperBound !== "") {
        range = IDBKeyRange.upperBound(this.filter.upperBound);
      } else if (this.filter.lowerBound !== "" && this.filter.upperBound !== "") {
        range = IDBKeyRange.bound(this.filter.lowerBound, this.filter.upperBound);
      }

      const getReq = objectStore.getAll(range);
      getReq.onsuccess = () => {
        this.employees = getReq.result;
        console.log("employees loaded");
      }

      getReq.onerror = () => {
        console.log(getReq.error);
      }
    },
    requestDelete(id) {
      this.idToDelete = id;
      this.deleteModal.show();
    },
    deleteConfirmed() {
      this.deleteModal.hide();

      const tx = this.db.transaction("employees", "readwrite");
      const store = tx.objectStore("employees");
      const req = store.delete(this.idToDelete);
      req.onsuccess = () => {
        this.idToDelete = null;
        this.loadEmployees();
      }

      return true;
    }
  },
  template: `
    <div class="employee-table-container">
      <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
          <div class="navbar-header">
            <a class="navbar-brand"><i class="fa-solid fa-user"/>Employees</a>
          </div>
          <form class="d-flex" >
            <div class="input-group">
              <span class="input-group-text" id="basic-addon1">Range Start</span>
              <input type="text" size="5" class="form-control" v-model="this.filter.lowerBound"
                     placeholder="Id" aria-label="High Id" aria-describedby="basic-addon1">
            </div>
            <div class="input-group">
              <span class="input-group-text" id="basic-addon1">Range End</span>
              <input type="text" size="5" class="form-control" v-model="this.filter.upperBound"
                     placeholder="Id" aria-label="High Id" aria-describedby="basic-addon1">
            </div>
            <button class="btn btn btn-outline-secondary" @click="loadEmployees">
              <i class="fa-solid fa-search"/>
            </button>
          </form>
          <form class="d-flex">
            <div class="form-group">
              <router-link to="/create-employee/"><button class="btn btn btn-outline-secondary"><i class="fa-solid fa-plus"/></button></router-link>
            </div>
            <div class="form-group">
              <button @click="loadEmployees" class="btn btn btn-outline-secondary"><i class="fa-solid fa-refresh"/></button>
            </div>
          </form>
        </div>
      </nav>
      <table class="table table-striped employee-table">
        <thead>
        <tr>
          <th scope="col">Employee Id</th>
          <th scope="col">First Name </th>
          <th scope="col">Last Name</th>
          <th scope="col">Social Security</th>
          <th scope="col">Email</th>
          <th scope="col" style="text-align: right">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(employee) in employees">
          <td class="employee-id"><router-link :to="'/employees/' + employee.id">{{ employee.id }}</router-link></td>
          <td>{{ employee.firstName }}</td>
          <td>{{ employee.lastName }}</td>
          <td>{{ employee.ssn }}</td>
          <td>{{ employee.email }}</td>
          <td class="actions">
            <router-link :to="'/employees/' + employee.id">
              <i class="fa-solid fa-user-edit"></i>
            </router-link>
            <a v-on:click="requestDelete(employee.id)">
              <i class="fa-solid fa-trash" ></i>
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="modal" tabindex="-1" id="delete-modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Delete</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the user with id "{{this.idToDelete}}"?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteConfirmed">Delete</button>
        </div>
      </div>
    </div>
    </div>
  `
};
