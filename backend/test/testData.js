import { randomUUID } from 'crypto';

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const plateid = randomUUID();

const newWellplate = () => ({
  name: 'TEST: New Wellplate',
  pid: '1',
  body: {
    plateid,
  },
});

const finishWellplate = () => ({
  name: 'TEST: Finish Wellplate',
  pid: '2',
  body: {
    plateid,
  },
});

const deleteWellplate = () => ({
  name: 'TEST: Delete Wellplate',
  pid: '12',
  body: {
    plateid,
  },
});

const validateWellplate = () => ({
  name: 'TEST: Validate Wellplate',
  pid: '7',
  body: {
    plateid,
  },
});

const importEPS = () => ({
  name: 'TEST: Import EPS',
  pid: '5',
  body: {
    plateid,
  },
});

const newSample = () => ({
  name: 'TEST: New Sample',
  pid: '3',
  body: {
    plateid,
    sampleid: randomUUID(),
    position: randomIntFromInterval(1, 96).toString(),
  },
});

const deleteSample = (sampleid, position) => ({
  name: 'TEST: Delete Sample',
  pid: '4',
  body: {
    plateid,
    sampleid,
    position,
  },
});

const sampleState = (sampleid, position) => ({
  name: 'TEST: Sample State',
  pid: '13',
  body: {
    plateid,
    sampleid,
    position,
    retry: 'NONE',
    result: Math.round(Math.random()) ? 'NEGATIVE' : 'POSITIVE',
    valid: !!Math.round(Math.random()),
  },
});

const matchPatient = (sampleid) => ({
  name: 'TEST: Match Patient',
  pid: '6',
  body: {
    sampleid,
  },
});

const exportEMS = (sampleid) => ({
  name: 'TEST: Export EMS',
  pid: '8',
  body: {
    sampleid,
  },
});

const exportResult = (sampleid) => ({
  name: 'TEST: Export Result',
  pid: '9',
  body: {
    sampleid,
    result: Math.round(Math.random()) ? 'N' : 'P',
    complete: true,
  },
});

export {
  newWellplate, finishWellplate, deleteWellplate,
  validateWellplate, importEPS, newSample, deleteSample,
  matchPatient, exportEMS, exportResult, sampleState,
};
