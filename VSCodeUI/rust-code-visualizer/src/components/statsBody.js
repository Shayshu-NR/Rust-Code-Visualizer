import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
} from 'chart.js';
import { Bar, Scatter, Pie } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { useEffect, useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function removeData(chart) {
  chart.data.labels.pop();
  chart.data.datasets.pop();
  chart.update();
}

function addData(chart, label, data) {
  label.forEach(x => chart.data.labels.push(x));
  data.forEach(x => chart.data.datasets.push(x));
  chart.update();
  console.log(chart);
  console.log(chart.data);
}

function StatsBody({ collapseState, programTarget }) {
  let classNames = require('classnames');
  let l1Data = {
    labels: [],
    datasets: []
  };
  let llData = {
    labels: [],
    datasets: []
  };
  let instructionData = {
    labels: [],
    datasets: []
  };
  let branchData = {
    labels: [],
    datasets: []
  };
  const l1ChartRef = useRef(null);
  const llChartRef = useRef(null);
  const instructionChartRef = useRef(null);
  const branchChartRef = useRef(null);

  // On Mount
  useEffect(() => {
    const l1Chart = l1ChartRef.current;
    const llChart = llChartRef.current;
    const instructionChart = instructionChartRef.current;
    const branchChart = branchChartRef.current;

    window.addEventListener('message', event => {
      const message = event.data;
      console.log("StatsBody Event:", event);

      switch (message.type) {
        case "profileDataResults":
          let profilerData = message.value;
          let data = profilerData.chart;

          // Update all four charts with the returned data....
          removeData(l1Chart);
          addData(l1Chart, data["L1 Data Cache Misses"].labels, data["L1 Data Cache Misses"].datasets);

          removeData(llChart);
          addData(llChart, data["LL Data Cache Misses"].labels, data["LL Data Cache Misses"].datasets);

          removeData(instructionChart);
          addData(instructionChart, data["Instruction Count"].labels, data["Instruction Count"].datasets);

          removeData(branchChart);
          addData(branchChart, data["Branch Mispredictions"].labels, data["Branch Mispredictions"].datasets);
          break;
      }
    });

    vscode.postMessage({ type: 'reqProfileData', value: programTarget });
  }, []);

  // On program target change
  useEffect(() => {
    console.log("Program target changed: ", programTarget);
    vscode.postMessage({ type: 'reqProfileData', value: programTarget });
  }, [programTarget]);

  let containerCollapseClass = classNames({
    'collapse': collapseState,
    'visible': !collapseState,
    'mx-auto': !collapseState,
    'px-2': !collapseState,
    'sm:px-6': !collapseState,
    'lg:px-8': !collapseState,
    'pb-4': !collapseState
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart',
      },
    },
  };

  const tableData = {
    data: Array.from({ length: 5 }, () => ({
      colData1: faker.datatype.float({ min: 0, max: 100 }),
      colData2: faker.datatype.float({ min: 0, max: 100 }),
      colData3: faker.datatype.float({ min: 0, max: 100 }),
      colData4: faker.datatype.float({ min: 0, max: 100 }),
      colData5: faker.datatype.float({ min: 0, max: 100 })
    }))
  };

  return (
    <div className={containerCollapseClass}>
      <div className="flex flex-row">
        <div className="basis-1/2">
          {/* L1 Data Cache Misses */}
          <Bar ref={l1ChartRef} options={options} data={l1Data} style={{ display: collapseState ? 'none' : '' }} className='!w-full text-white' />
        </div>
        <div className="basis-1/2">
          {/* LL Data Cache Misses */}
          <Bar ref={llChartRef} options={options} data={llData} style={{ display: collapseState ? 'none' : '' }} className='!w-full text-white' />
        </div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/2">
          {/* Instruction Count */}
          <Bar ref={instructionChartRef} options={options} data={instructionData} style={{ display: collapseState ? 'none' : '' }} className='!w-full text-white' />
        </div>
        <div className="basis-1/2">
          {/* Branch Mispredictions */}
          <Bar ref={branchChartRef} options={options} data={branchData} style={{ display: collapseState ? 'none' : '' }} className='!w-full text-white' />
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='text-white basis-full'>
          <table className='table-auto w-full border-collapse border border-slate-600 rounded-md p-5'>
            <thead>
              <tr className='justify-start'>
                <th className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>Col1</th>
                <th className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>Col2</th>
                <th className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>Col3</th>
                <th className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>Col4</th>
                <th className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>Col5</th>
              </tr>
            </thead>
            <tbody>
              {tableData.data.map((row) =>
              (
                <tr>
                  <td className='border border-slate-600 p-4'>{row.colData1}</td>
                  <td className='border border-slate-600 p-4'>{row.colData2}</td>
                  <td className='border border-slate-600 p-4'>{row.colData3}</td>
                  <td className='border border-slate-600 p-4'>{row.colData4}</td>
                  <td className='border border-slate-600 p-4'>{row.colData5}</td>
                </tr>
              )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StatsBody;