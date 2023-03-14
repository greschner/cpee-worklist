import axios from 'axios';
import https from 'https';
import { loggingURL } from '../config.js';

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false,
});

export default {
  getLogs(params) {
    return axios.get(`${loggingURL}/log`, { params, httpsAgent: agent });
  },
  getLogById(id) {
    return axios.get(`${loggingURL}/log/${id}`);
  },
  getBi(params) {
    return axios.get(`${loggingURL}/bi`, { params });
  },
};
