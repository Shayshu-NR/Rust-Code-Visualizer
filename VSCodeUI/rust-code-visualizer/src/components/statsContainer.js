import '../input.css';
import {useState} from 'react';
import GraphFooter from './graphFooter.js';
import Header from './header';
import StatsBody from './statsBody';

function StatsContainer({programTarget}) {
    const [containerCollapse, setContainerCollapse] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const handleCollapse = _ => {
        setContainerCollapse(containerCollapse => !containerCollapse);
    };

    const setParentSearchValue = (childSearchValue) => {
        setSearchValue(childSearchValue);
    };


    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            {/* Header */}
            <Header header="Performance Statistics" handleCollapse={handleCollapse} collapseState={containerCollapse}></Header>
            
            <StatsBody collapseState={containerCollapse} programTarget={programTarget} searchValue={searchValue}></StatsBody>

            {/* Footer */}
             <GraphFooter collapseState={containerCollapse} setParentSearchValue={setParentSearchValue}></GraphFooter>
        </div>
    );
}


export default StatsContainer;