import { useEffect, useState } from "react";

function SearchBar({ setParentFileData, setParentProgramTarget }) {
    const [filesResults, setFileResults] = useState([]);

    useEffect(() => {
        // Subscribe to file results and ask for the data
        window.addEventListener('message', event => {
            const message = event.data;
            console.log(event);
            switch (message.type) {
                case "filesResults":
                    setFileResults(message.value);
                    setParentFileData(message.value);
                    break;
            }
        });
        vscode.postMessage({ type: 'reqFiles', value: 'Request for Files' });
    }, []);

    const handleTargetProgramSelection = (event) => {
        console.log(event);
        setParentProgramTarget(event.target.value);
    };

    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            <div className="mx-auto px-2 sm:px-6 lg:px-8 bg-gray-500 w-full rounded">
                <div className="flex flex-row h-full align-middle p-2">
                    <div className='my-auto basis-2/3'>
                        <label for="files" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a program target</label>
                        <select id="files" onChange={handleTargetProgramSelection} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            {filesResults?.map((file, index) => <option value={file}>{file}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchBar;