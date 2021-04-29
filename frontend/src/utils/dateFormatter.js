export default (_row, _column, cellValue) => {
  const d = new Date(cellValue);
  return `${(`0${d.getDate()}`).slice(-2)}.${(`0${d.getMonth() + 1}`).slice(-2)}.${
    d.getFullYear()} ${(`0${d.getHours()}`).slice(-2)}:${(`0${d.getMinutes()}`).slice(-2)}`;
};
