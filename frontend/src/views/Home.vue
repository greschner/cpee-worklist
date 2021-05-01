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
    <el-table-column
      label="Operations"
    >
      <template #default="scope">
        <el-button
          size="mini"
          type="primary"
          @click="execute(scope.row)"
        >
          Execute
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
// @ is an alias to /src
import { watchEffect } from 'vue';
import worklistApi from '../api/worklist';
import df from '../utils/dateFormatter';

export default {
  name: 'Home',
  inject: ['socket'],
  data: () => ({
    tableData: null,
  }),
  created() {
    this.socket.on('getTasks', () => {
      this.getTask();
    });
  },
  mounted() {
    watchEffect(async () => {
      this.getTask();
    });
  },
  methods: {
    df,
    async getTask() {
      try {
        const { data } = await worklistApi.getTask();
        this.tableData = data;
      } catch (error) {
        this.$notify.error({
          title: 'Error',
          message: `${error.message}: ${error.response.data.error || ''}`,
        });
      }
    },
    async execute({ _id }) {
      try {
        await worklistApi.executeTask(_id);
      } catch (error) {
        this.$notify.error({
          title: 'Error',
          message: `${error.message}: ${error.response.data.error || ''}`,
        });
      }
    },
  },
};
</script>
