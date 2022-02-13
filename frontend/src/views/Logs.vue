<template>
  <el-row justify="space-between">
    <el-col :span="3">
      <el-button
        type="success"
        @click="export1"
      >
        Export {{ multipleSelectionNumber ? '('+multipleSelectionNumber+')' : '' }}
      </el-button>
    </el-col>
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
    @selection-change="handleSelectionChange"
  >
    <el-table-column
      type="selection"
      width="45"
      :reserve-selection="true"
    />
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
  <el-dialog
    v-model="dialogVisible"
    title="Export"
    width="40%"
  >
    <el-form
      ref="exportForm"
      :model="exportForm"
    >
      <div v-if="!multipleSelectionNumber">
        <el-form-item
          label="Timerange"
          label-width="80px"
        >
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            unlink-panels
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="shortcuts"
            :default-time="defaultTime"
          />
        </el-form-item>
        <el-form-item label="Task type">
          <el-checkbox
            v-model="exportForm.checkAll"
            :indeterminate="exportForm.isIndeterminate"
            @change="handleCheckAllChange"
          >
            Check all
          </el-checkbox>
          <el-checkbox-group
            v-model="exportForm.checkedTasks"
            @change="handleCheckedTaskChange"
          >
            <el-checkbox
              v-for="{text, value} in filters.nameFilter"
              :key="value"
              :label="value"
            >
              {{
                text
              }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>
      <el-form-item
        label="Format"
        label-width="70px"
      >
        <el-select v-model="exportForm.format">
          <el-option
            label="CSV"
            value="csv"
          />
          <el-option
            label="JSON"
            value="json"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          :loading="loadingBtn"
          @click="exp"
        >Export<el-icon class="el-icon--right"><Download /></el-icon></el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { watchEffect } from 'vue';
import { Download } from '@element-plus/icons-vue';
import LogApi from '../api/logs';
import oFunc from '../utils/sort';
import downloadCSVData from '../utils/downloadCsv';
import downloadJsonData from '../utils/downloadJson';
import df from '../utils/dateFormatter';
import { errorMessage, successMessage } from '../utils/notifications';
import { resultFormatter, resultConverter } from '../utils/tableFormatter';
import setupStream from '../api/sse';
import shortcuts, { generateDateRange } from '../utils/dateShortcuts';

export default {
  components: {
    Download,
  },
  data: () => ({
    tableData: [],
    shortcuts,
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
    exportForm: {
      format: 'json',
      checkAll: true,
      isIndeterminate: false,
      taskOptions: [],
      checkedTasks: [],
      dateRange: generateDateRange(3600 * 1000 * 24 * 7),
    },
    watchEffectTrigger: false,
    multipleSelection: [],
    multipleSelectionNumber: 0,
    dialogVisible: false,
    defaultTime: [
      new Date(2000, 1, 1, 0, 0, 0),
      new Date(2000, 2, 1, 23, 59, 59),
    ],
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
        this.filters.cIdFilter,
        this.search,
      );
    });
    this.filters.userFilter = await this.filterGroupBy('user');
    this.filters.nameFilter = await this.filterGroupBy('name');
    const ids = this.filters.nameFilter.map(({ value }) => value);
    this.exportForm.taskOptions = ids;
    this.exportForm.checkedTasks = ids;
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
    downloadCSVData,
    downloadJsonData,
    async getLogs(limit, page, sort, order, user, id, search) {
      try {
        const { data: { data, count } } = await LogApi.getLogs({
          limit, page, sort, order, user, id, [this.searchSelect]: search,
        });
        this.tableData = data;
        this.pagination.itemscount = count;
      } catch (error) {
        this.errorMessage(error);
      }
    },
    onSortChange({ prop, order }) {
      this.sort.field = prop;
      this.sort.order = order;
    },
    async filterGroupBy(groupby) {
      try {
        const { data: { data } } = await LogApi.getLogs({ groupby });
        if (['id', 'name'].includes(groupby)) {
          return data.map(({ _id }) => ({ text: _id[groupby], value: _id.id }));
        }
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
        this.filters.cIdFilter = filters.name;
      }
      if (filters.id) {
        this.filters.cIdFilter = filters.id;
      }
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows;
      this.multipleSelectionNumber = rows.length;
    },
    handleCheckAllChange(val) {
      this.exportForm.checkedTasks = val ? this.exportForm.taskOptions : [];
      this.exportForm.isIndeterminate = false;
    },
    handleCheckedTaskChange(value) {
      const checkedCount = value.length;
      this.exportForm.checkAll = checkedCount === this.exportForm.taskOptions.length;
      this.exportForm.isIndeterminate = checkedCount > 0
      && checkedCount < this.exportForm.taskOptions.length;
    },
    export1() {
      this.dialogVisible = true;
    },
    async exp() {
      let d = this.multipleSelection;
      try {
        this.loadingBtn = true;
        if (!this.multipleSelectionNumber) {
          const [start, end] = this.exportForm.dateRange;
          const { data: { data } } = await LogApi.getLogs({
            start, end, id: this.exportForm.checkedTasks,
          });
          if (!data.length) {
            throw new Error('Cannot export empty object');
          }
          d = data;
        }
        if (this.exportForm.format === 'json') {
          this.downloadJsonData(d);
        } else {
          this.csvLocal(d);
        }
        this.dialogVisible = false;
      } catch (error) {
        this.errorMessage(error);
        /* this.$notify.info({
          title: 'Info',
          message: `${error.message}`,
        }); */
      } finally {
        this.loadingBtn = false;
      }
    },
    csvLocal(data) {
      let csv = 'MongoID,ID,Name,User,Timestamp,Macaddress,SampleID,PlateID,Position,Result,Complete\n';
      data.forEach(({
        // eslint-disable-next-line no-unused-vars
        _id, id, macaddress, name, timestamp, user,
        body: {
          sampleid, plateid, position, result, complete,
        },
      }) => {
        // get all properties as comma separated string: Object.values(sampleObj).toString()
        csv += `${_id},${id},${name},${user},${timestamp},${macaddress},${sampleid ?? ''},${plateid ?? ''},${position ?? ''},${result ?? ''},${complete ?? ''}\n`;
      });
      this.downloadCSVData(csv);
    },
  },

};
</script>

<style>
.el-select {
    width: 130px;
  }
</style>
