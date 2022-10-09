import EmployeeTable from "./EmployeeTable.js";

export default {
  props: [],
  data: () => {
    return {
      db: null
    };
  },
  created() {
    this.db = this.$parent.$data.db;
  },
  mounted() {

  },
  methods: {

  },
  components: {
    EmployeeTable
  },
  template: `
    <h1>Employees</h1>
    <employee-table :db="this.db"></employee-table>
  `
};
