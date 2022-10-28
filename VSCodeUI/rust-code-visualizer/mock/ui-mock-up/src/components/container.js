import '../input.css';

function Container() {
    return (
        <div className="container mx-auto px-4 rounded bg-gray-700 border-slate-600">
            {/* Header */}
            <div className="mx-auto px-2 sm:px-6 lg:px-8 pb-4">
                Header

            </div>

            {/* Body */}
            <div className="mx-auto px-2 sm:px-6 lg:px-8 pb-4">


            </div>

            {/* Footer */}
            <div className="mx-auto px-2 sm:px-6 lg:px-8 pb-4">
                <div className='flex flex-row'>
                    <div className='basis-1/4'>
                        <div class="relative">
                            <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input type="search" id="default-search" class="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" />
                            <button type="submit" class="search-btn">Search</button>
                        </div>
                    </div>
                    <div className='basis-1/4'>
                        <p className='text-white'>Btns</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Container;