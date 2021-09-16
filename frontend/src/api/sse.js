export default (url, onMessageCallback) => {
  const es = new EventSource(url);

  es.onmessage = onMessageCallback;

  es.onerror = (err) => console.error('EventSource failed:', err);
};
