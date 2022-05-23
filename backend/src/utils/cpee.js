import FormData from 'form-data';
import axios from './getAxios';
import { taskModel, producedModel } from '../model';
import logger from '../logger';

// debug log every request
/* axios.interceptors.request.use((request) => {
  console.log('Request: ', JSON.stringify(request, null, 2));
  return request;
}); */

const callbackInstance = (instance, body, headers = {}) => {
  if (!instance) {
    return null;
  }
  return axios.put(instance, body, { headers });
};

const changeState = (id, value = 'running') => {
  if (!id) {
    return null;
  }
  return axios.put(
    `https://cpee.org/flow/engine/${id}/properties/state/`,
    new URLSearchParams({
      value,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
};

const startInstance = (id) => changeState(id);

const stopInstance = (id) => changeState(id, 'stopping');

const abandonInstance = (id) => changeState(id, 'abandoned');

const abandonInstances = (from, to) => {
  // const arr = [];

  // eslint-disable-next-line no-plusplus
  for (let i = from; i <= to; i++) {
    axios.get(`https://cpee.org/flow/engine/${i}/properties/state/`)
      .then(({ data }) => {
        if (data === 'running') {
          stopInstance(i)
            .then(() => { abandonInstance(i).catch((e) => e); })
            .catch((e) => e);
        } else if (data === 'stopped') {
          abandonInstance(i).catch((e) => e);
        }
      })
      .catch((e) => e);
  }
};

const newInstanceXML = (xml, behavior = 'wait_running') => {
  if (!xml) {
    return null;
  }
  const formData = new FormData();
  formData.append('behavior', behavior);
  formData.append('xml', xml, {
    contentType: 'text/xml',
  });
  return axios.post(
    process.env.CPEE_XML,
    formData,
    {
      headers: { ...formData.getHeaders() },
    },
  );
};

const newInstanceURL = (url, behavior = 'wait_running') => {
  if (!url) {
    return null;
  }
  return axios.post(
    process.env.CPEE_URL,
    new URLSearchParams({
      behavior,
      url,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
};

const matchTask = (pid, body) => {
  switch (pid) {
    case '3':
    case '4':
    case '5':
    case '7':
      return producedModel.findOne({ pid, 'body.plateid': body.plateid });
    case '6':
    case '8':
    case '9':
      return producedModel.findOne({ pid, 'body.sampleid': body.sampleid });
    case '13':
      return producedModel.findOne({
        pid,
        'body.sampleid': body.sampleid,
        'body.plateid': body.plateid,
        'body.position': body.position,
      });
    default:
      return producedModel.findOne({ pid });
  }
};

const correlator = async () => {
  console.log('run');
  try {
    const openTasks = await taskModel.find({}); // get all open tasks
    await Promise.all(openTasks.map(async ({
      pid, callback, _id: id, body, label, instance,
    }) => {
      const producedTask = await matchTask(pid, body); // match

      if (producedTask) {
        logger.info(`MATCH Task: ${{
          id, label, pid, instance, body,
        }} with ${producedTask}`);

        const cArr = ['1', '2'].includes(pid);

        await Promise.all([
          callbackInstance(callback, {
            ...producedTask.body,
            timestamp: producedTask.timestamp,
          }, cArr && { 'cpee-update': true }), // callback to CPEE
          ...!cArr ? [taskModel.findByIdAndDelete(id)] : [], // remove from task list
          ...pid !== '6' ? [
            producedModel.findByIdAndDelete(producedTask._id),
          ] : [], // remove from produced list
        ]);

        // sendEventsToAll(id, 'remove'); // sse
      }
    }));
  } catch (error) {
    console.error(error);
  }
};

export {
  startInstance, stopInstance, abandonInstance, newInstanceXML, newInstanceURL, callbackInstance,
  abandonInstances, changeState, correlator,
};
