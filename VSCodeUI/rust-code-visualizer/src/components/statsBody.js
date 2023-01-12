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
import { useEffect, useRef, useState } from 'react';

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

const tableColumnName = [
  "Function Name",
  "Instruction Count",
  "Data Reads",
  "Data Writes",
  "First level I cache misses",
  "First level data cache read misses",
  "First level data cache write misses",
  "Last level instruction cache misses",
  "Last level data cache read misses",
  "Last level data cache write misses",
  "Total branches",
  "Branch Mispredictions",
  "Total indirect jumps",
  "Indirect jump address mispredictions"
];

function removeData(chart) {
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  chart.data.datasets.pop();
  chart.update();
}

function addData(chart, label, data) {
  label.forEach(x => chart.data.labels.push(x));
  data.forEach(x => chart.data.datasets.push(x));
  chart.update();
}

function formatTableData(preData) {
  let postData = {
    "columns": tableColumnName,
    "rows": []
  };

  try {
    let i = 0;
    for (let [key, value] of Object.entries(preData)) {
      postData.rows.push([]);
      postData.rows[i].push(key);
      for (let [innerKey, innerValue] of Object.entries(value)) {
        postData.rows[i].push(innerValue);
      }
      i++;
    }
    return postData;
  }
  catch {
    return {
      "columns": tableColumnName,
      "rows": []
    };
  }
}


function StatsBody({ collapseState, programTarget }) {
  const [tableData, setTableData] = useState({
    "columns": [],
    "rows": []
  });

  let classNames = require('classnames');

  const [l1Data, setl1Data] = useState({
    labels: [],
    datasets: []
  });
  const [llData, setllData] = useState({
    labels: [],
    datasets: []
  });
  const [instructionData, setinstructionData] = useState({
    labels: [],
    datasets: []
  });
  const [branchData, setbranchData] = useState({
    labels: [],
    datasets: []
  });
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
          let tabularData = profilerData.table;

          // Update all four charts with the returned data....
          setl1Data({
            labels: data["L1 Data Cache Misses"].labels,
            datasets: data["L1 Data Cache Misses"].datasets
          });

          setllData(
            {
              labels: data["LL Data Cache Misses"].labels,
              datasets: data["LL Data Cache Misses"].datasets
            }
          );

          setinstructionData(
            {
              labels: data["Instruction Count"].labels,
              datasets: data["Instruction Count"].datasets
            }
          );

          setbranchData(
            {
              labels: data["Branch Mispredictions"].labels,
              datasets: data["Branch Mispredictions"].datasets
            }
          );

          setTableData(formatTableData(tabularData));
          break;
      }
    });

    if (programTarget.target?.value !== undefined) {
      vscode.postMessage({ type: 'reqProfileData', value: programTarget.target.value });
    }
  }, []);

  // On program target change
  useEffect(() => {
    console.log("Program target changed: ", programTarget);
    if (programTarget.target?.value !== undefined) {
      vscode.postMessage({ type: 'reqProfileData', value: programTarget.target.value });
    }
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
      <div className='flex flex-row mt-2 overflow-scroll'>
        <div className='text-white basis-full'>
          <table className='table-auto w-full border-collapse border border-slate-600 rounded-md p-5'>
            <thead>
              <tr className='justify-start'>
                {tableData.columns.map((col) => <th className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row) =>
              (
                <tr>
                  {row?.map((data) => (
                    <td className='border border-slate-600 p-4'>{data}</td>
                  ))}
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