import EmployeeTable from "./EmployeeTable.js";

export default {
  props: [],
  data: () => {
    return {};
  },
  created: function () {

  },
  methods: {

  },
  components: {
    EmployeeTable
  },
  template: `
    <h1>Home</h1>
    <employee-table></employee-table>
    `
};
