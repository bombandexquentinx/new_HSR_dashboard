import React from "react";
import { CircleChart } from "./CircleChart";

const CircleChartWidget = ({ title, data = [] }) => {
    const series = data.map((d) => d.value);
  
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col xl:flex-row items-center">
            {/* Circle Chart Section */}
            <div className="w-full flex justify-center mb-6 xl:mb-0">
              {/* Replace CircleChart with your actual chart component */}
              <CircleChart series={data} title={title} />
            </div>
  
            {/* Data Section */}
            <div className="w-full xl:w-3/5 xl:px-0">

            </div>
          </div>
        </div>
      </div>
    );
  };
  

  export default CircleChartWidget;