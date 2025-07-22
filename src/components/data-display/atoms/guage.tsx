import * as React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

export default function GaugeResponsive(props: { number: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 150, height: 150 });

  React.useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const value = props.number;

  const check = (value: number) => {
    if (value >= 91 && value <= 100) {
      return "red";
    } else if (value >= 75 && value <= 90) {
      return "orange";
    } else {
      return "#52b202";
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '300px',
        aspectRatio: '1 / 1',
      }}
    >
      <Gauge
        width={size.width}
        height={size.height}
        value={value}
        cornerRadius="50%"
        sx={(theme) => ({
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: size.width * 0.25, // scale with width
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: `${check(value)}`,
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: theme.palette.text.disabled,
          },
        })}
      />
    </div>
  );
}
