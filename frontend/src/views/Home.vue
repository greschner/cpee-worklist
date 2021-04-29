<template>
  <el-table
    :data="tableData"
    style="width: 100%"
  >
    <el-table-column
      prop="label"
      label="Task Name"
      sortable
    />
    <el-table-column
      prop="activity"
      label="Activity"
      sortable
    />
    <el-table-column
      prop="timestamp"
      :formatter="df"
      label="Timestamp"
      sortable
    />
  </el-table>
</template>

<script>
// @ is an alias to /src
import { watchEffect } from 'vue';
import worklistApi from '../api/worklist';
import df from '../utils/dateFormatter';

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
    df,
  },
};
</script>
