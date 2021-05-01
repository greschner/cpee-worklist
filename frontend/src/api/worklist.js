import axios from 'axios';

const sampleURL = `${process.env.VUE_APP_BACKEND}`;

export default {
  getTask(id) {
    console.log(sampleURL);
    return id ? axios.get(`${sampleURL}/tasks/${id}`) : axios.get(sampleURL);
  },
  executeTask(id, body) {
    return axios.put(`${sampleURL}/tasks/${id}`, body);
  },
};
