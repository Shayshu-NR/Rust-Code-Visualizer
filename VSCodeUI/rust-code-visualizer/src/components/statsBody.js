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
import ReactPaginate from 'react-paginate';
import ReactLoading from 'react-loading';
import Fuse from 'fuse.js';

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

//----- Functions -----
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

function Items({ currentItems }) {

  return (
    <>
      {currentItems?.map((row) => (
        <tr className='bg-gray-800 border-gray-700'>
          {row?.map((data, index) => (
            index === 0 ?
              (<th scope="row" className='border border-slate-600 px-6 py-4 font-medium whitespace-nowrap text-white'>{data}</th>) :
              (<td className='border border-slate-600 px-6 py-4'>{data}</td>)
          ))}
        </tr>
      ))}
    </>
  );
}
//---------------------

function StatsBody({ collapseState, programTarget, searchValue }) {
  //----- State -----
  const [tableData, setTableData] = useState({
    "columns": [],
    "rows": []
  });
  const [filteredTableData, setFilteredTableData] = useState({
    "columns": [],
    "rows": []
  });
  // const l1Data = useRef({
  //   labels: [],
  //   datasets: []
  // });
  const [l1Data, setL1Data] = useState({
    labels: [],
    datasets: []
  });

  const [llData, setLlData] = useState({
    labels: [],
    datasets: []
  });

  const [instructionData, setInstructionData] = useState({
    labels: [],
    datasets: []
  });

  const [branchData, setBranchData] = useState({
    labels: [],
    datasets: []
  });

  const [itemOffset, setItemOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  //-----------------

  //----- Set up -----
  let classNames = require('classnames');
  let containerLoading = classNames({
    "cursor-not-allowed": loading,
    "opacity-75": loading,
    "mx-auto": true,
    "px-2": true,
    "sm:px-6": true,
    "lg:px-8": true,
    "pb-4": true,
    "relative": true,
    "z-0": true,
  });
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Profiler Data',
      },
    },
  };
  const itemsPerPage = 5;
  const endOffset = itemOffset + itemsPerPage;
  console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  const currentItems = filteredTableData.rows.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredTableData.rows.length / itemsPerPage);
  //------------------

  //----- Ref -----
  const l1ChartRef = useRef(null);
  const llChartRef = useRef(null);
  const instructionChartRef = useRef(null);
  const branchChartRef = useRef(null);
  //---------------

  //----- Effect -----
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
          let apiData = profilerData.chart;
          let tabularData = profilerData.table;

          // Update all four charts with the returned data....
          // setL1Data({
          //   labels: apiData["L1 Data Cache Misses"].labels,
          //   datasets: apiData["L1 Data Cache Misses"].datasets
          // });

          setL1Data({
            labels: apiData["L1 Data Cache Misses"].labels,
            datasets: apiData["L1 Data Cache Misses"].datasets
          });

          setLlData({
            labels: apiData["LL Data Cache Misses"].labels,
            datasets: apiData["LL Data Cache Misses"].datasets
          });

          setInstructionData({
            labels: apiData["Instruction Count"].labels,
            datasets: apiData["Instruction Count"].datasets
          });

          setBranchData({
            labels: apiData["Branch Mispredictions"].labels,
            datasets: apiData["Branch Mispredictions"].datasets
          });

          // Update table data
          let tableDataFormatted = formatTableData(tabularData);
          setTableData(tableDataFormatted);
          setFilteredTableData(tableDataFormatted);

          setLoading(false);
          break;
      }
    });

    if (programTarget.target?.value !== undefined) {
      vscode.postMessage({ type: 'reqProfileData', value: programTarget.target.value });
    }
  }, []);

  useEffect(() => {
    console.log("Program target changed: ", programTarget);
    if (programTarget.target?.value !== undefined) {
      setLoading(true);
      vscode.postMessage({ type: 'reqProfileData', value: programTarget.target.value });
    }
  }, [programTarget]);

  useEffect(() => {
    console.log(searchValue);


    if (searchValue.searchValue !== undefined && searchValue.searchValue !== "") {
      var fuse = new Fuse(tableData.rows.map(x => x[0]));

      let searchRes = fuse?.search(searchValue.searchValue === undefined ? "" : searchValue.searchValue);
      let searchResNames = searchRes?.map(x => x.item);
      let filteredRows = tableData.rows.filter(x => searchResNames.includes(x[0]));
      setFilteredTableData(
        {
          "columns": tableData.columns,
          "rows": filteredRows
        }
      );
        
    }
    else {
      setFilteredTableData(tableData);
    }
  }, [searchValue]);
  //------------------

  //----- Callback -----
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % tableData.rows.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  //--------------------

  return (
    <div className={containerLoading}>
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
      <div className='flex flex-row mt-2'>
        <div className='text-white basis-full overflow-x-scroll rounded-md'>
          <table className='table-auto w-full border-collapse border border-slate-600 rounded-md p-5 text-left text-gray-400'>
            <thead className='text-xs uppercase bg-gray-700 text-gray-400'>
              <tr className='justify-start'>
                {tableData.columns.map((col) =>
                  <th scope="col" className='border border-slate-600 font-semibold p-4 text-left bg-slate-500'>{col}</th>
                )}
              </tr>
            </thead>
            <tbody>
              <Items currentItems={currentItems} />
            </tbody>
          </table>
        </div>
      </div>
      <div className='flex mx-auto mt-4 w-full justify-center'>
        <div className='mx-auto'>
          <ReactPaginate
            nextLabel={<>Next <i class='bi bi-caret-right'></i></>}
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel={<><i class='bi bi-caret-left'></i> Previous</>}
            pageClassName="page-item"
            pageLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            previousClassName="page-item"
            nextLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            nextClassName="page-item"
            previousLinkClassName="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            containerClassName="inline-flex -space-x-px"
            activeClassName="active"
            renderOnZeroPageCount={null}
          />
        </div>
      </div>
      {loading ?
        <div class="absolute inset-0 flex justify-center items-center z-10 text-white">
          <ReactLoading type={"spin"} color={"#ffffff"}></ReactLoading>
        </div> :
        null
      }
    </div>
  );
}

export default StatsBody;