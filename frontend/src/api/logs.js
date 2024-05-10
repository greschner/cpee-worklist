import axios from 'axios';

const sampleURL = process.env.VUE_APP_LOGGING_SERVICE || 'http://localhost:80/logging/log';
const sampleURLBi = process.env.VUE_APP_BI_SERVICE || 'http://localhost:80/logging/bi';

export default {
  getLogs(params) {
    return axios.get(sampleURL, { params });
  },
  getLogById(id) {
    return axios.get(`${sampleURL}/${id}`);
  },
  getBi(params) {
    return axios.get(sampleURLBi, { params });
  },
};
