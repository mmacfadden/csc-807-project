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
    <div class="description-box">
    Below is a table of mock employees.  Employees are store as ecnrypted values in IndexedDB. 
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
    </div>
    <employee-table :db="db"></employee-table>
  `
};
