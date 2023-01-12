import { useEffect, useState } from "react";

function SearchBar({ setParentFileData, setParentProgramTarget }) {
    const [filesResults, setFileResults] = useState([]);
    const [fileChosen, setFileChosen] = useState("");

    useEffect(() => {
        // Subscribe to file results and ask for the data
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case "filesResults":
                    setFileResults(message.value);
                    setParentFileData(message.value);

                    console.log(fileChosen, filesResults);
                    if (message.value.length > 0) {
                        setFileChosen(message.value[0]);
                    }
                    console.log(fileChosen, filesResults);
                    break;
            }
        });
        vscode.postMessage({ type: 'reqFiles', value: 'Request for Files' });
    }, []);

    const handleTargetProgramSelection = (event) => {
        setFileChosen(event.target.value);
    };

    const handleTargetProgramConfirm = (event) => {
        setParentProgramTarget({
            event: event,
            target: {
                value: fileChosen
            }
        });
    };

    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            <div className="mx-auto px-2 sm:px-6 lg:px-8 bg-gray-500 w-full rounded">
                <div className="flex flex-row h-full align-middle p-2">
                    <div className='my-auto basis-2/3'>
                        <label for="files" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a program target</label>
                        <select id="files" value={fileChosen} onChange={handleTargetProgramSelection} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            {filesResults?.map((file, index) => <option value={file}>{file}</option>)}
                        </select>
                    </div>
                    <div className='ml-2 my-auto mb-0 align-baseline flex items-center'>
                        <button id="select-file" className="option-btn bg-sky-500 rounded-md" onClick={handleTargetProgramConfirm}>
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchBar;