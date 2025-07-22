import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';


type BarChartRow = {
  [key: string]: string | number | null; // still allows flexibility
};

interface BarsDatasetProps {
  series: { dataKey: string; label: string }[];
  dataset: BarChartRow[];
  xAxisKey?: string; // default to 'month'
}



function valueFormatter(value: number | null) {
  return `${value?.toLocaleString() || 0}`;
}

const chartSetting = {
  yAxis: [
    {
      label: 'Sales',
      width: 60,
    },
  ],
  height: 250,
};

export default function BarsDataset({ series, dataset }: BarsDatasetProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = React.useState(250);

    function truncateLabel(label: string, maxLength = 15) {
    if (label.length <= maxLength) return label;
    return label.slice(0, maxLength) + '...';
  }

  React.useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });

    observer.observe(currentContainer);
    return () => {
      observer.unobserve(currentContainer);
      observer.disconnect();
    };
  }, []);

  // Enhanced data validation
  if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-gray-400">
        No valid dataset available
      </div>
    );
  }

  if (!series || !Array.isArray(series) || series.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-gray-400">
        No series configuration available
      </div>
    );
  }

  // Transform series to MUI expected format
  const muiSeries = series.map(s => ({
    dataKey: s.dataKey,
    label: truncateLabel(s.label, 15),
    valueFormatter,
  }));

  // Verify that all dataKeys exist in the dataset
  const validSeries = muiSeries.filter(s => {
    return dataset.some(item => s.dataKey in item);
  });

  if (validSeries.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-gray-400">
        No matching data keys found in dataset
      </div>
    );
  }

  // Verify that 'month' field exists in dataset
  if (!dataset[0].month) {
    return (
      <div className="w-full h-full flex justify-center items-center text-gray-400">
        Dataset is missing &#39;month&#39; field
      </div>

    );
  }




  return (
    <div ref={containerRef} className="w-full h-auto relative ">
      <div className="flex justify-center items-center w-full">
        <BarChart
          dataset={dataset}
          xAxis={[{ 
            dataKey: 'month', 
            scaleType: 'band',
            valueFormatter: (value) => String(value)
          }]}
          series={validSeries}
          {...chartSetting}
          width={chartWidth}
          margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
        />
      </div>
     
    </div>
  );
}