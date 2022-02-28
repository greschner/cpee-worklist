import axios from 'axios';

export default {
  getBD() {
    return axios.get(process.env.VUE_APP_BD_SERVICE);
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
