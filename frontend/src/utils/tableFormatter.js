const resultFormatter = (result) => {
  switch (result) {
    case 'P':
      return 'danger';
    case 'N':
      return 'success';
    default:
      return 'warning';
  }
};

const statusFormatter = (status) => {
  switch (status) {
    case 'invalid':
      return 'danger';
    case 'unprocessed':
      return 'danger';
    case 'validated':
      return 'success';
    case 'sequenced':
      return 'success';
    case 'processed':
      return 'warning';
    default:
      return 'info';
  }
};

const resultConverter = (result) => {
  switch (result) {
    case 'P':
      return 'Positive';
    case 'N':
      return 'Negative';
    case 'D':
      return 'Delayed';
    default:
      return 'Unknown';
  }
};

const plateSampleFormatter = (sampleid) => {
  switch (sampleid) {
    case null:
      return 'danger';
    case 'LW':
      return '';
    case 'P':
      return 'warning';
    default:
      return 'info';
  }
};

const statusFormatterPlate = (status) => {
  switch (status) {
    case 'cancelled':
      return 'danger';
    case 'validated':
      return 'success';
    case 'processed':
      return 'warning';
    default:
      return 'info';
  }
};

export {
  resultFormatter, statusFormatter, resultConverter, plateSampleFormatter, statusFormatterPlate,
};
