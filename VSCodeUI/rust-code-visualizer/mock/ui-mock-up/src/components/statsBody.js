import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {faker} from '@faker-js/faker';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);



function StatsBody({ collapseState }) {
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
  


    return (
        <div className={containerCollapseClass}>
            <Bar options={options} data={data} style={{display: collapseState ? 'none' : 'block'}}/>
        </div>
    )
}

export default StatsBody;