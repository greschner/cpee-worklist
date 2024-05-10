import axios from 'axios';

export default {
  getBD() {
    const baseURL = process.env.VUE_APP_BD_SERVICE || 'http://localhost:80/logging/bd';
    return axios.get(baseURL);
  },
  getBasedata(data) {
    const nameFilter = data.map(({ id, label }) => ({
      text: label, value: id,
    }));
    const idFilter = data.map(({ id }) => ({ text: id, value: id }));
    const ids = data.map(({ id }) => id);
    // this.exportForm.taskOptions = ids;
    // this.exportForm.checkedTasks = ids;
    return {
      nameFilter,
      idFilter,
      ids,
    };
  },
};
