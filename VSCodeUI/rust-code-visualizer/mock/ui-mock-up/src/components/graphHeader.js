import '../input.css';

function GraphHeader(props) {
    return (
        <div className="mx-auto px-2 sm:px-6 lg:px-8 pb-4 bg-gray-500 w-full rounded h-14">
            <div className="flex flex-row h-full align-middle">
                <div className="basis-4/5">
                    <h1 className="text-left text-white flex align-middle h-full">
                       <span className="align-middle">Call Graph</span>
                    </h1>
                </div>
                <div className="basis-1/5">
                    <button className="h-full">
                        <i className="bi bi-caret-down text-white h-full justify-end"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GraphHeader;