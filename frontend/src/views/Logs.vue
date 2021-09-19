<template>
  <el-row justify="end">
    <el-col :span="7">
      <el-input
        v-model="search"
        prefix-icon="el-icon-search"
        :placeholder="`Type to search after ${searchSelect === 'sid' ? 'sampleid':'plateid'}...`"
        clearable
      >
        <template #prepend>
          <el-select
            v-model="searchSelect"
          >
            <el-option
              label="SampleID"
              value="sid"
            />
            <el-option
              label="PlateID"
              value="pid"
            />
          </el-select>
        </template>
      </el-input>
    </el-col>
  </el-row>
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
      column-key="id"
      label="ID"
      sortable="custom"
      :filters="filters.idFilter"
    />
    <el-table-column
      prop="name"
      column-key="name"
      label="Name"
      sortable="custom"
      :filters="filters.nameFilter"
    />
    <el-table-column
      prop="info"
      column-key="info"
      label="Info"
    >
      <template #default="scope">
        <el-tag
          v-if="scope.row.id === '9'"
          :type="resultFormatter(scope.row.body.result)"
          size="medium"
        >
          {{ resultConverter(scope.row.body.result) }}
        </el-tag>
        <el-tag v-else-if="['1','2','5','7'].includes(scope.row.id)">
          {{ scope.row.body?.plateid }}
        </el-tag>
        <el-tag
          v-else
          type="info"
        >
          {{ scope.row.body?.sampleid }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="timestamp"
      column-key="timestamp"
      label="Timestamp"
      :formatter="df"
      sortable="custom"
    />
    <el-table-column
      prop="user"
      label="User"
      sortable="custom"
      column-key="user"
      :filters="filters.userFilter"
    />
    <el-table-column
      prop="macaddress"
      column-key="macaddress"
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
        :page-sizes="[100, 200, 500, 1000]"
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
import { resultFormatter, resultConverter } from '../utils/tableFormatter';
import setupStream from '../api/sse';

export default {
  data: () => ({
    tableData: [],
    tableHeight: null,
    loadingBtn: false,
    search: '',
    searchSelect: 'sid',
    pagination: {
      pagesize: 100,
      currentpage: 1,
      itemscount: 0,
    },
    sort: {
      field: null,
      order: null,
    },
    filters: {
      userFilter: [],
      nameFilter: [],
      idFilter: [],
      user: null,
      cUserFilter: [],
      cNameFilter: [],
      cIdFilter: [],
    },
    watchEffectTrigger: false,
  }),
  created() {
    this.setupStream(process.env.VUE_APP_SSE_LOGS, (event) => {
      if (this.pagination.currentpage === 1 && !this.sort.field
      && !this.filters.cIdFilter.length && !this.filters.cNameFilter.length
      && !this.filters.cUserFilter.length && !this.search) {
        const data = JSON.parse(event.data);
        this.tableData.unshift(data);
        if (this.pagination.itemscount >= this.pagination.pagesize) {
          this.tableData.pop();
        }
        this.pagination.itemscount += 1;
      }
    });
  },
  async mounted() {
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    window.addEventListener('resize', () => {
      this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
    });
    watchEffect(() => {
      this.watchEffectTrigger = !this.watchEffectTrigger;
      this.getLogs(
        this.pagination.pagesize,
        this.pagination.currentpage,
        this.sort.field,
        oFunc(this.sort.order),
        this.filters.cUserFilter,
        this.filters.cNameFilter,
        this.filters.cIdFilter,
        this.search,
      );
    });
    this.filters.userFilter = await this.filterGroupBy('user');
    this.filters.nameFilter = await this.filterGroupBy('name');
    this.filters.idFilter = await this.filterGroupBy('id');
  },
  methods: {
    oFunc,
    df,
    errorMessage,
    successMessage,
    setupStream,
    resultFormatter,
    resultConverter,
    async getLogs(limit, page, sort, order, user, name, id, search) {
      try {
        const { data: { data, count } } = await LogApi.getLogs({
          limit, page, sort, order, user, name, id, [this.searchSelect]: search,
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
        this.filters.cUserFilter = filters.user;
      }
      if (filters.name) {
        this.filters.cNameFilter = filters.name;
      }
      if (filters.id) {
        this.filters.cIdFilter = filters.id;
      }
    },
  },

};
</script>

<style>
.el-select {
    width: 130px;
  }
</style>
