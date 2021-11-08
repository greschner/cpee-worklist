const yaxisName = (task) => {
  switch (task) {
    case '1':
      return 'Number of created wellplates';
    case '2':
      return 'Number of finished wellplates';
    case '3':
      return 'Number of scanned samples';
    case '4':
      return 'Number of deleted samples';
    case '5':
      return 'Number of imports to EPS';
    case '6':
      return 'Number of imported data';
    case '7':
      return 'Number of validated wellplates';
    case '8':
      return 'Number of exports to EMS';
    case '9':
      return 'Number of exported results';
    default:
      return 'Undefined Task!';
  }
};

// eslint-disable-next-line import/prefer-default-export
export { yaxisName };
