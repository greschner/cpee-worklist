const downloadCSVData = (csv) => {
  const anchor = document.createElement('a');
  anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  const d = new Date();
  anchor.download = `export_${(`0${d.getDate()}`).slice(-2)}_${(`0${d.getMonth() + 1}`).slice(-2)}_${
    d.getFullYear()}_${(`0${d.getHours()}`).slice(-2)}_${(`0${d.getMinutes()}`).slice(-2)}_${(`0${d.getSeconds()}`).slice(-2)}.csv`;
  anchor.click();
};

export default downloadCSVData;
