import axios from 'axios';

const sampleURL = `${process.env.VUE_APP_LOGGING_SERVICE}`;

export default {
  getLogs(params) {
    return axios.get(sampleURL, { params });
  },
  getLogById(id) {
    return axios.get(`${sampleURL}/${id}`);
  },
};
