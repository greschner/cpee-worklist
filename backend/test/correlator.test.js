// eslint-disable-next-line import/no-extraneous-dependencies
// import { jest } from '@jest/globals';
import axios from 'axios';
import * as testData from './testData';

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const correlatorRef = 'https://greschner.azurewebsites.net/backend/corr';
const headers = {
  'content-id': 'producer',
};
const numberOfSamples = 10;
const numberOfSampleDeletes = 2;
const samples = [];

// init db
/* beforeAll(async () => {
  await db.connect();
}); */

test('New Wellplate', async () => {
  const response = await axios.post(correlatorRef, testData.newWellplate(), { headers });
  expect(response.status).toBe(200);
});

test('New Sample', async () => {
  const promises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfSamples; i++) {
    const sample = testData.newSample();
    samples.push(sample);
    promises.push(axios.post(correlatorRef, sample, { headers }));
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
  }
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});

/* test('Delete Sample', async () => {
  if (numberOfSampleDeletes < numberOfSamples) {
    const promises = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfSampleDeletes; i++) {
      const { body: { sampleid, position } } = samples[i];
      const sampleDelete = testData.deleteSample(sampleid, position);
      promises.push(axios.post(correlatorRef, sampleDelete, { headers }));
    }
    const responses = await Promise.all(promises);
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });
  }
}); */

test('Finish Wellplate', async () => {
  const response = await axios.post(correlatorRef, testData.finishWellplate(), { headers });
  expect(response.status).toBe(200);
});

test('Import EPS', async () => {
  const response = await axios.post(correlatorRef, testData.importEPS(), { headers });
  expect(response.status).toBe(200);
});

test('Validate Wellplate', async () => {
  const response = await axios.post(correlatorRef, testData.validateWellplate(), { headers });
  expect(response.status).toBe(200);
});

test('Match Patient Data', async () => {
  const promises = [];
  samples.forEach(({ body: { sampleid } }) => {
    promises.push(axios.post(correlatorRef, testData.matchPatient(sampleid), { headers }));
  });
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});

test('Sample State', async () => {
  const promises = [];
  samples.forEach(({ body: { sampleid, position } }) => {
    promises.push(axios.post(correlatorRef, testData.sampleState(sampleid, position), { headers }));
  });
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});

test('Export EMS', async () => {
  const promises = [];
  samples.forEach(({ body: { sampleid } }) => {
    promises.push(axios.post(correlatorRef, testData.exportEMS(sampleid), { headers }));
  });
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});

test('Export Result', async () => {
  const promises = [];
  samples.forEach(({ body: { sampleid } }) => {
    promises.push(axios.post(correlatorRef, testData.exportResult(sampleid), { headers }));
  });
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});

// disconnect db
/* afterAll(async () => {
  await db.disconnect();
}); */
