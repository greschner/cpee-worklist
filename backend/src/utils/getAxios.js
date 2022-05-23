import axios from 'axios';
import https from 'https';
import http from 'http';

const instance = axios.create({
  timeout: 60000, // optional
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

export default instance;
