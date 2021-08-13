<template>
  <el-table
    ref="table"
    row-key="_id"
    :data="tableData"
    style="width: 100%"
    :height="tableHeight"
    @sort-change="onSortChange"
    @filter-change="onFilterChange"
  >
    <el-table-column type="expand">
      <template #default="props">
        <p
          v-for="(value, name) in props.row.body"
          :key="name"
        >
          {{ name }}: {{ value }}
        </p>
      </template>
    </el-table-column>
    <el-table-column
      prop="id"
      label="ID"
      sortable="custom"
    />
    <el-table-column
      prop="name"
      label="Name"
      sortable="custom"
    />
    <el-table-column
      prop="timestamp"
      label="Timestamp"
      :formatter="df"
      sortable="custom"
    />
    <el-table-column
      prop="user"
      label="User"
      sortable="custom"
      :filters="filters.userFilter"
    />
    <el-table-column
      prop="macaddress"
      label="Mac-Address"
      sortable="custom"
    />
  </el-table>
  <el-row
    type="flex"
    justify="center"
    style="margin-top: 8px;"
  >
    <el-col style="max-width: fit-content;">
      <el-pagination
        v-model:currentPage="pagination.currentpage"
        v-model:page-size="pagination.pagesize"
        :page-sizes="[50, 100, 200, 500]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.itemscount"
      />
    </el-col>
  </el-row>
</template>

<script>
import { watchEffect } from 'vue';
import LogApi from '../api/logs';
import oFunc from '../utils/sort';
import df from '../utils/dateFormatter';
import { errorMessage, successMessage } from '../utils/notifications';

export default {
  data: () => ({
    tableData: [],
    tableHeight: null,
    loadingBtn: false,
    pagination: {
      pagesize: 50,
      currentpage: 1,
      itemscount: 0,
    },
    sort: {
      field: null,
      order: null,
    },
    cUserFilter: [],
    filters: {
      userFilter: [],
      nameFilter: [],
      idFilter: [],
      user: null,
    },
  }),
  async mounted() {
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    window.addEventListener('resize', () => {
      this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    });
    watchEffect(() => {
      this.getLogs(
        this.pagination.pagesize,
        this.pagination.currentpage,
        this.sort.field,
        oFunc(this.sort.order),
      );
    });
    this.filters.userFilter = await this.filterGroupBy('user');
  },
  methods: {
    oFunc,
    df,
    errorMessage,
    successMessage,
    async getLogs(limit, page, sort, order, user) {
      try {
        const { data: { data, count } } = await LogApi.getLogs({
          limit, page, sort, order, user,
        });
        this.tableData = data;
        this.pagination.itemscount = count;
      } catch (error) {
        errorMessage(error);
      }
    },
    onSortChange({ prop, order }) {
      this.sort.field = prop;
      this.sort.order = order;
    },
    async filterGroupBy(groupby) {
      try {
        const { data: { data } } = await LogApi.getLogs({ groupby });
        return data.map(({ _id }) => ({ text: _id, value: _id }));
      } catch (error) {
        return errorMessage(error);
      }
    },
    onFilterChange(filters) {
      if (filters.user) {
        this.userFilter = filters.user;
      }
    },
  },

};
</script>

<style>

</style>
