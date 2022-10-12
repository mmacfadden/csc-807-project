import EmployeeTable from "./EmployeeTable.js";

export default {
  props: ["db"],
  data: () => {
    return {};
  },
  created() {

  },
  methods: {

  },
  components: {
    EmployeeTable
  },
  template: `
    <div class="accordion" id="accordionExample">
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingOne">
        <button class="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapseOne" 
                aria-expanded="false" 
                aria-controls="collapseOne">
          Instructions
        </button>
      </h2>
      <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
        <div class="accordion-body">
          Below is a table of mock employees.  Employees are store as encrypted values in IndexedDB.
          The following actions can be performed:
          <ul>
            <li>
              Employees can be edited by clicking on the employee ID, or by clicking the
              <i class="fa-solid fa-user-edit"/> icon in the actions column.
            </li>
            <li>
              An employee can be deleted by clicking the <i class="fa-solid fa-trash" />.
            </li>
            <li>
              An employee can be added by clicking the <i class="fa-solid fa-plus" /> button in the tool bar.
            </li>
            <li>
              A range of employees can be selected by entering a range start and/or end value and then hitting the
              <i class="fa-solid fa-search" /> button.
            </li>
            <li>
              The employees table can be reloaded by clicking the <i class="fa-solid fa-refresh" /> button.
            </li>
          </ul>
          More information about this application and the underlying architecture can be found by 
          visiting the <router-link to="/about">About Page</router-link>.
        </div>
      </div>
    </div>
    </div>
    <employee-table :db="db"></employee-table>
  `
};
