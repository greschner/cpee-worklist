<template>
      <el-table
      :data="tableData">
<el-table-column
        prop="date"
        label="Date"
        width="180">
      </el-table-column>
      </el-table>
</template>

<script>
// @ is an alias to /src
import { watchEffect } from 'vue';
import worklistApi from '../api/worklist';

export default {
  name: 'Home',
  data: () => ({
    tableData: null,
  }),
  mounted() {
    watchEffect(async () => {
      try {
        const { data } = await worklistApi.getTask();
        this.tableData = data;
      } catch (error) {
        this.$notify.error({
          title: 'Error',
          message: `${error.message}: ${error.response.data.error || ''}`,
        });
      }
    });
  },
  methods: {
  },
};
</script>
