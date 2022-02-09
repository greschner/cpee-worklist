import axios from 'axios';
import { CORRELATOR_URL } from '../env';

export default {
  getTask(id) {
    return id ? axios.get(`${CORRELATOR_URL}/tasks/${id}`) : axios.get(CORRELATOR_URL);
  },
  executeTask(id, body) {
    return axios.put(`${CORRELATOR_URL}/tasks/${id}`, body);
  },
};
