// salesData.ts

export const chartXAxis = [
  {
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    scaleType: 'point',
    label: 'Weeks of current month',
    sx: {
      '& .MuiChartsAxis-tickLabel': {
        fontSize: 12,
        fill: '#4b5563',
      },
      '& .MuiChartsAxis-label': {
        fontSize: 12,
        fontWeight: 600,
        fill: '#1f2937',
      },
    },
  },
];

export const chartYAxis = [
  {
    label: 'Sales',
    sx: {
      '& .MuiChartsAxis-tickLabel': {
        fontSize: 13,
        fill: '#4b5563',
      },
      '& .MuiChartsAxis-label': {
        fontSize: 14,
        fontWeight: 600,
        fill: '#1f2937',
      },
    },
  },
];

export const chartSeries = [
  {
    data: [1200, 1500, 1300, 1600, 1800, 1700, 2000],
    label: 'Sales',
    color: '#876FD4',
    area: false,
  },
];
