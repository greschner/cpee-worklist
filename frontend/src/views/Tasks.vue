<template>
  <el-table
    ref="table"
    :data="tableData"
    :height="tableHeight"
    :row-class-name="tableRowClassName"
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
      prop="body.process"
      label="Process"
      sortable
    />
    <el-table-column
      prop="instance"
      label="Instance"
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
import { watchEffect } from 'vue';
import { errorMessage } from '../utils/notifications';
import { CORRELATOR_URL } from '../env';
import worklistApi from '../api/worklist';
import df from '../utils/dateFormatter';

export default {
  name: 'Tasks',
  data: () => ({
    tableData: [],
    tableIDs: [],
    tableHeight: null,
  }),
  created() {
    // sse
    this.setupStream();
  },
  mounted() {
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    window.addEventListener('resize', () => {
      this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    });
    watchEffect(() => {
      this.getTask();
    });
  },
  beforeUnmount() {

  },
  methods: {
    df,
    setupStream() {
      const es = new EventSource(`${CORRELATOR_URL}corr/sse`);

      es.onerror = (err) => console.error('EventSource failed:', err);

      es.addEventListener('add', (event) => {
        const data = JSON.parse(event.data); // parse data to obj
        this.tableData.unshift(data); // add element on top of table
      });

      es.addEventListener('remove', (event) => {
        const id = JSON.parse(event.data); // parse data to obj
        // eslint-disable-next-line no-underscore-dangle
        this.tableData = this.tableData.filter((item) => item._id !== id); // remove item from table
      });
    },
    async getTask() {
      try {
        const { data } = await worklistApi.getTask();
        this.tableData = data;
        this.tableIDs = data.map(({ _id: id }) => id);
      } catch (error) {
        errorMessage(error);
      }
    },
    tableRowClassName({ row }) {
      // eslint-disable-next-line no-underscore-dangle
      if (!this.tableIDs.includes(row._id)) {
        // eslint-disable-next-line no-underscore-dangle
        setTimeout(() => this.tableIDs.push(row._id), 3000);
        return 'warning-row';
      }
      return '';
    },
  },
};
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-lighter);
  transition: --el-table-tr-bg-color 3000ms linear;
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-lighter);
}
@keyframes fadeOut {
  0% {
    opacity:1;
  }
  100% {
    opacity:0;
  }
}
</style>
