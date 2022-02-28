import axios from 'axios';
import { CORRELATOR_URL } from '../env';

export default {
  getTask(params) {
    return axios.get(CORRELATOR_URL, { params });
  },
  getTaskByID(id, params) {
    return axios.get(`${CORRELATOR_URL}/tasks/${id}`, { params });
  },
  executeTask(id, body) {
    return axios.put(`${CORRELATOR_URL}/tasks/${id}`, body);
  },
};
