import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';

function GraphFooter({ collapseState, setParentSearchValue, setParentBtn1Click, setParentBtn2Click, setParentBtn3Click, keepButtons }) {
    const [searchValue, setSearchValue] = useState("");

    let classNames = require('classnames');

    let containerCollapseClass = classNames({
        'collapse': collapseState,
        'visible': !collapseState,
        'mx-auto': !collapseState,
        'px-2': !collapseState,
        'sm:px-6': !collapseState,
        'lg:px-8': !collapseState,
        'pb-4': !collapseState,
        'hidden': collapseState
    });

    const handleSearchBtnClick = (event) => {
        setParentSearchValue(
            {
                event: event,
                searchValue: event.target.value
            }
        );
    };

    const clearBtnClick = (event) => {
        setParentSearchValue(
            {
                event: event,
                searchValue: ""
            }
        );
    };

    const searchValueChange = (event) => {
        event.preventDefault();
        setSearchValue(event.target.value);
    };

    const exportBtnClick = (event) => {
        setParentBtn3Click(event);
    };

    return (
        <div className={containerCollapseClass}>
            <div className='flex flex-row'>
                <div className='basis-2/5'>
                    <div className="relative">
                        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                            <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input value={searchValue} onChange={searchValueChange} onKeyUp={handleSearchBtnClick} type="search" id="default-search" className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" />
                        <button type="submit" className="search-btn" onClick={handleSearchBtnClick}><i className="bi bi-x-circle"></i></button>
                    </div>
                </div>
                <div className='basis-2/6'>

                </div>
                {(keepButtons || false ?
                    (
                        <>
                            <div className='basis-1/6'>
                                <div className="flex align-middle rounded-md items-center pl-3 h-full w-full" role="group">
                                    <button type="button" className="option-btn rounded-l-md">
                                        Btn1
                                    </button>
                                    <button type="button" className="option-btn">
                                        Btn2
                                    </button>
                                    <button onClick={exportBtnClick} type="button" className="option-btn rounded-r-md" data-tooltip-target="export-tooltip">
                                        <i class="bi bi-file-earmark-image"></i>
                                    </button>
                                    <div id="export-tooltip" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                                        Export Graph
                                        <div class="tooltip-arrow" data-popper-arrow></div>
                                    </div>
                                </div>
                            </div>
                            <div className="basis-1/12">
                                <div className="flex align-middle rounded-md items-center pl-3 h-full">
                                    <button type="button" className="option-btn rounded-md">
                                        <i class="bi bi-filter text-3xl"></i>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (<></>)
                )}
            </div>
        </div>
    );
}

export default GraphFooter;