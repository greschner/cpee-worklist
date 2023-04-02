import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { cpeeURL } from '../config.js';

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const getVisitLink = (id) => `${cpeeURL}flow/index.html?monitor=${cpeeURL}flow/engine/${id}/`;

const getVisitLinkURL = (url) => `${cpeeURL}flow/index.html?monitor=${url}/`;

const getInstanceState = (id) => axios.get(`${cpeeURL}flow/engine/${id}/properties/state/`);

// const getInstanceState = (id) => 'running';

const getEngineInformation = (engine = 'https%3A%2F%2Fcpee.org%2Fflow%2Fengine%2F') => axios.get(`${cpeeURL}hub/server/dash/stats/?engine=${engine}`);

const getInstanceInformation = (engine = 'https%3A%2F%2Fcpee.org%2Fflow%2Fengine%2F') => axios.get(`${cpeeURL}hub/server/dash/instances?engine=${engine}`);

const getCurrentInstances = async (engine = 'https%3A%2F%2Fcpee.org%2Fflow%2Fengine%2F') => {
  try {
    const { data: cpeeInstancesXML } = await getInstanceInformation(engine);
    const parser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true,
      attributeNamePrefix: '',
    });
    const cpeeInstancesObj = parser.parse(cpeeInstancesXML);
    return cpeeInstancesObj.instances.instance;
  } catch (error) {
    return console.error(error);
  }
};

const changeState = (id, value = 'running') => {
  if (!id) {
    return null;
  }
  return axios.put(
    `${cpeeURL}flow/engine/${id}/properties/state/`,
    new URLSearchParams({
      value,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
};

const abandonInstance = (from, to = from + 1) => {
  if (!from) return null;

  // eslint-disable-next-line no-plusplus
  for (let i = from; i < to; i++) {
    setTimeout(() => {
      axios.get(`${cpeeURL}flow/engine/${i}/properties/state/`)
        .then(({ data }) => {
          if (data === 'running') {
            changeState(i, 'stopping')
              .then(() => {
                setTimeout(() => {
                  changeState(i, 'abandoned').catch((e) => e);
                }, 2000);
              })
              .catch((e) => e);
          } else if (data === 'stopped' || data === 'ready') {
            changeState(i, 'abandoned').catch((e) => e);
          }
        })
        .catch((e) => e);
    }, randomIntFromInterval(500, 5000));
  }

  return true;
};

const newInstanceURL = (url, behavior = 'wait_running') => {
  if (!url) {
    return null;
  }
  return axios.post(
    `${cpeeURL}flow/start/url/`,
    new URLSearchParams({
      behavior,
      url,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
};

const startInstance = (url) => {
  if (!url) {
    return null;
  }
  return axios.put(
    `${url}/properties/state/`,
    new URLSearchParams({
      value: 'running',
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
};

export {
  getInstanceState,
  getVisitLink,
  getVisitLinkURL,
  getEngineInformation,
  getInstanceInformation,
  abandonInstance,
  newInstanceURL,
  startInstance,
  getCurrentInstances,
};
