import axios from 'axios';

const sampleURL = process.env.VUE_APP_CORRELATOR;

export default {
  getTask(id) {
    return id ? axios.get(`${sampleURL}/tasks/${id}`) : axios.get(sampleURL);
  },
  executeTask(id, body) {
    return axios.put(`${sampleURL}/tasks/${id}`, body);
  },
};
