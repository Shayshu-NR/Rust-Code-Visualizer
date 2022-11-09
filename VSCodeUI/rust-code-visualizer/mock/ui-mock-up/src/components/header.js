import '../input.css';

function Header({ header, handleCollapse, collapseState }) {
    let classNames = require('classnames');
    let caretClass = classNames({
        'bi': true,
        'bi-caret-down': !collapseState,
        'bi-caret-up' : collapseState,
        'text-white': true,
        'text-4xl': true,
        'h-full': true,
        'my-auto': true
    });

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
                            <i className={caretClass}></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header;