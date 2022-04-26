import axios from 'axios';
import FormData from 'form-data';

// debug log every request
axios.interceptors.request.use((request) => {
  console.log('Request: ', JSON.stringify(request, null, 2));
  return request;
});

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

const stopInstance = (id) => changeState(id, 'stopped');

const abandonInstance = (id) => changeState(id, 'abandoned');

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

export {
  startInstance, stopInstance, abandonInstance, newInstanceXML, newInstanceURL, callbackInstance,
};
