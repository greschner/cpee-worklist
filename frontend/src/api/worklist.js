import axios from 'axios';

const sampleURL = `${process.env.VUE_APP_BACKEND}`;

export default {
  getTask(id) {
    console.log(sampleURL);
    return id ? axios.get(`${sampleURL}/${id}`) : axios.get(sampleURL);
  },
};
