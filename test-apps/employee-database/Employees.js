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
    <div>Some description</div>
    <employee-table :db="db"></employee-table>
  `
};
