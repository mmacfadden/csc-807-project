import EmployeeTable from "./EmployeeTable.js";

export default {
  props: [],
  data: () => {
    return {
      employeeId: null,
      db: null,
      employee: {

      }
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
    <h1>Edit Employee</h1>
    <form>
      <input v-model="employee.message" placeholder="edit me" />
    </form>
  `
};
