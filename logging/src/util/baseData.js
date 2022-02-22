import { baseDataModel } from '../model';

const initData = [
  {
    id: '1',
    label: 'New Wellplate',
  },
  {
    id: '2',
    label: 'Finish Wellplate',
  },
  {
    id: '3',
    label: 'Scanned Sample',
  },
  {
    id: '4',
    label: 'Deleted Sample',
  },
  {
    id: '5',
    label: 'Import EPS',
  },
  {
    id: '6',
    label: 'Match Patient Data',
  },
  {
    id: '7',
    label: 'Validated Plate',
  },
  {
    id: '8',
    label: 'Export EMS',
  },
  {
    id: '9',
    label: 'Export Result',
  },
  {
    id: '11',
    label: 'Initial Scan',
  },
  {
    id: '12',
    label: 'Deleted Plate',
  },
];

const initBaseData = () => baseDataModel.insertMany(initData);

const newBaseData = (data) => {
  if (!data) {
    return null;
  }

  return baseDataModel.create(data);
};

export { initBaseData, newBaseData };
