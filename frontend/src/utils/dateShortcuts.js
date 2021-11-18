const generateDateRange = (m) => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - m);
  return [start, end];
};

export { generateDateRange };

export default [
  {
    text: 'Today',
    value: () => {
      const curr = new Date();
      return [
        new Date(curr.setHours(0, 0, 0, 0)),
        new Date(curr.setHours(23, 59, 59, 999)),
      ];
    },
  },
  {
    text: 'Yesterday',
    value: () => {
      const curr = new Date();
      curr.setTime(curr.getTime() - 3600 * 1000 * 24);
      return [
        new Date(curr.setHours(0, 0, 0, 0)),
        new Date(curr.setHours(23, 59, 59, 999)),
      ];
    },
  },
  {
    text: 'This week',
    value: () => {
      const curr = new Date();
      return [
        new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).setHours(0, 0, 0, 0),
        new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)).setHours(23, 59, 59, 999),
      ];
    },
  },
  {
    text: 'Last week',
    value: () => {
      const curr = new Date();
      return [
        new Date(new Date(curr.setDate(curr.getDate() - ((curr.getDay() + 6) % 7)))
          .setDate(curr.getDate() - 7)).setHours(0, 0, 0, 0),
        new Date(curr.setDate(curr.getDate() - 1)).setHours(23, 59, 59, 999),
      ];
    },
  },
  {
    text: 'This month',
    value: () => {
      const curr = new Date();
      return [
        new Date(curr.getFullYear(), curr.getMonth(), 1),
        new Date(curr.getFullYear(), curr.getMonth() + 1, 0).setHours(23, 59, 59, 999),
      ];
    },
  },
  {
    text: 'Last month',
    value: () => {
      const curr = new Date();
      return [
        new Date(curr.getFullYear(), curr.getMonth() - 1, 1),
        new Date(curr.getFullYear(), curr.getMonth(), 0).setHours(23, 59, 59, 999),
      ];
    },
  },
  {
    text: 'Last 30 days',
    value: generateDateRange(3600 * 1000 * 24 * 30),
  },
  {
    text: 'Last 90 days',
    value: generateDateRange(3600 * 1000 * 24 * 90),
  },
  {
    text: 'This year',
    value: () => {
      const curr = new Date();
      return [
        new Date(curr.getFullYear(), 0, 1),
        new Date(curr.getFullYear(), 11, 31).setHours(23, 59, 59, 999),
      ];
    },
  },
  {
    text: 'Last year',
    value: () => {
      const curr = new Date();
      return [
        new Date(curr.getFullYear() - 1, 0, 1),
        new Date(curr.getFullYear() - 1, 11, 31).setHours(23, 59, 59, 999),
      ];
    },
  },
];
