<template>
  <el-table
    ref="table"
    :data="tableData"
    :height="tableHeight"
    :row-class-name="tableRowClassName"
    style="width: 100%"
    @filter-change="onFilterChange"
  >
    <el-table-column
      prop="label"
      label="Task Name"
      sortable
      column-key="name"
      :filters="filters.nameFilter"
    />
    <el-table-column
      prop="pid"
      label="ID"
      sortable
      column-key="id"
      :filters="filters.idFilter"
    />
    <el-table-column
      prop="activity"
      label="Activity"
      sortable
    />
    <el-table-column
      label="Instance"
      sortable
    >
      <template #default="scope">
        <el-link
          :href="'https://cpee.org/flow/edit.html?monitor='+scope.row.instanceUrl"
          :underline="false"
          target="_blank"
          type="primary"
        >
          {{ scope.row.instance }}
        </el-link>
      </template>
    </el-table-column>
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
import { mapState } from 'vuex';
import { errorMessage } from '../utils/notifications';
import { CORRELATOR_URL } from '../env';
import worklistApi from '../api/worklist';
import df from '../utils/dateFormatter';
import BaseDataApi from '../api/basedata';

let es;

export default {
  name: 'Tasks',
  data: () => ({
    tableData: [],
    tableIDs: [],
    tableHeight: null,
    filters: {
      nameFilter: [],
      idFilter: [],
      cIdFilter: [],
    },
  }),
  computed: {
    ...mapState(['baseData']),
  },
  watch: {
    baseData: {
      immediate: true,
      handler(val) {
        const { nameFilter, idFilter } = BaseDataApi.getBasedata(val);
        this.filters.nameFilter = nameFilter;
        this.filters.idFilter = idFilter;
      },
    },
  },
  created() {
    // sse
    this.setupStream();
  },
  mounted() {
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    window.addEventListener('resize', this.resizeEventListener);
    watchEffect(() => {
      this.getTask(this.filters.cIdFilter);
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeEventListener);
    es.close();
  },
  methods: {
    df,
    setupStream() {
      es = new EventSource(`${CORRELATOR_URL}corr/sse`);

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
    async getTask(id) {
      try {
        const { data } = await worklistApi.getTask({ id });
        this.tableData = data;
        this.tableIDs = data.map(({ _id }) => _id.id);
      } catch (error) {
        errorMessage(error);
      }
    },
    onFilterChange(filters) {
      if (filters.name) {
        this.filters.cIdFilter = filters.name;
      }
      if (filters.id) {
        this.filters.cIdFilter = filters.id;
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
    resizeEventListener() {
      this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
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
