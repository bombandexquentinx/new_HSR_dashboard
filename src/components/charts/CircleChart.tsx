import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

export const CircleChart = ({ series, title }) => {
  // Map series data to the format expected by PieChart
  const chartData = series.map((item, index) => ({
    id: index,
    value: item.value, // or any other property like `published`, `unpublished`, etc.
    label: item.label,
  }));

  return (
    <div className="w-full flex justify-center items-center">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <PieChart
        series={[
          {
            data: chartData,
          },
        ]}
        width={400}
        height={200}
        title={title}
      />
    </div>
  );
};
