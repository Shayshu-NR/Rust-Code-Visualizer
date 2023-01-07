import { useEffect, useState } from "react";

function SearchBar() {
    const [filesResults, setFileResults] = useState(["Test File.rs", "Another Test File.rs"]);

    useEffect(() => {
        window.addEventListener('message', event => {
            const message = event.data;
            console.log(event);
            switch (message.type) {
                case "filesResults":
                    setFileResults(message.value);
                    break;
            }
        });
        vscode.postMessage({ type: 'reqFiles', value: 'Request for Files' });
    }, []);

    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            <div className="mx-auto px-2 sm:px-6 lg:px-8 bg-gray-500 w-full rounded">
                <div className="flex flex-row h-full align-middle p-2">
                    <div className='my-auto basis-1/3'>
                        <label for="files" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a program target</label>
                        <select id="files" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            {filesResults?.map((value, index) => <option>{value}</option>)}
                        </select>
                    </div>
                    <div className='ml-2 my-auto mb-0 align-baseline flex items-center'>
                        <button className="option-btn bg-sky-500 rounded-md"><i className="bi bi-arrow-clockwise"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchBar;