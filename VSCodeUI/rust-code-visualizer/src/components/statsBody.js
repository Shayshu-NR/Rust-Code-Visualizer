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
import { useEffect } from 'react';

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



function StatsBody({ collapseState }) {
  useEffect(() => {
    console.log("Mounted");
    window.addEventListener('message', event => {
      const message = event.data;
      console.log(message);
    });
    
    vscode.postMessage({ type: 'onInfo', value: 'Hello from statsBody.js' });


  }, []);

  let classNames = require('classnames');

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
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };

  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Dataset 2',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: 'A dataset',
        data: Array.from({ length: 100 }, () => ({
          x: faker.datatype.number({ min: -100, max: 100 }),
          y: faker.datatype.number({ min: -100, max: 100 }),
        })),
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const scatterOptions = {
    scales: {
      y: {
        beginAtZero: true,
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
  }

  return (
    <div className={containerCollapseClass}>
      <div className="flex flex-row">
        <div className="basis-1/2">
          <Bar options={options} data={data} style={{ display: collapseState ? 'none' : '' }} className='!w-full text-white' />
        </div>
        <div className="basis-1/2">
          <Scatter options={scatterOptions} data={scatterData} style={{ display: collapseState ? 'none' : '' }} className='!w-full !text-white' />
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