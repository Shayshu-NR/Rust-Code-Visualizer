import '../input.css';

function Header({header, handleCollapse}) {
    return (
        <div className="mx-auto px-2 sm:px-6 lg:px-8 bg-gray-500 w-full rounded h-14">
            <div className="flex flex-row h-full align-middle">
                <div className="basis-4/5 flex">
                    <div className='my-auto'>
                        <h2 className='text-white text-2xl'>
                            {header}
                        </h2>
                    </div>

                </div>
                <div className="basis-1/5 flex">
                    <div className='my-auto ml-auto'>
                         <button className="h-full flex" onClick={event => handleCollapse()}>
                            <i className="bi bi-caret-down text-white text-4xl h-full my-auto"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header;