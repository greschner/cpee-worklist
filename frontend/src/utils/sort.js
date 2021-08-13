export default (o) => {
  if (o === 'ascending') return 1;
  if (o === 'descending') return -1;
  return null;
};
