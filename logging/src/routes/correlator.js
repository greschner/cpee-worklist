import express from 'express';
import { readFile } from 'fs/promises';
import createError from 'http-errors';
import axios from 'axios';
import FormData from 'form-data';
import { URLSearchParams } from 'url';
import logger from '../logger';
import { crudMid, idValMid, schemaValMid } from '../middleware';

/* axios.interceptors.request.use((request) => {
  console.log('Request: ', JSON.stringify(request, null, 2));
  return request;
}); */

const router = express.Router();

router.use((req, res, next) => {
  console.log(process.env.CPEE_URL);
  next(); // pass control to the next handler
});

/* router.post('/', async (req, res) => {
  try {
    // const xml = await readFile('/Users/jangreschner/dockerProjects/labMaster/logging/test_sub.xml', { encoding: 'utf8' });
    if (req.headers['CPEE-CALLBACK']) {
      return res.writeHead(200, { 'CPEE-CALLBACK': 'true' });
    }
    res.send('k');
  } catch (error) {
    console.error(error);
  }
}); */

router.all('/', (req, res) => {
  res.sendStatus(200);
});

export default router;
