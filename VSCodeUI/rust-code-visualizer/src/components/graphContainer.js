import '../input.css';
import {useState} from 'react';
import GraphFooter from './graphFooter.js';
import GraphBody from './graphBody';
import Header from './header';

function GraphContainer({filesResults, programTarget}) {
    const [containerCollapse, setContainerCollapse] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [btn1Click, setBtn1Click] = useState({});
    const [btn2Click, setBtn2Click] = useState({});
    const [btn3Click, setBtn3Click] = useState({});

    const handleCollapse = _ => {
        setContainerCollapse(containerCollapse => !containerCollapse);
    };

    const setParentSearchValue = (childSearchValue) => {
        setSearchValue(childSearchValue);
    };

    const setParentBtn3Click = (childBtn3Event) => {
        setBtn3Click(childBtn3Event);
    };

    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            {/* Header */}
            <Header header="Call Graph" handleCollapse={handleCollapse} collapseState={containerCollapse}></Header>
                
            {/* Body */}
            <GraphBody collapseState={containerCollapse} programTarget={programTarget} searchValue={searchValue} exportGraph={btn3Click}></GraphBody>

            {/* Footer */}
             <GraphFooter collapseState={containerCollapse} setParentSearchValue={setParentSearchValue} keepButtons={true} setParentBtn3Click={setParentBtn3Click}></GraphFooter>
        </div>
    );
}

export default GraphContainer;