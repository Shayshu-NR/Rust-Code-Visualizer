import '../input.css';
import {useState} from 'react'
import GraphFooter from './graphFooter.js';
import Header from './header';
import StatsBody from './statsBody';

function StatsContainer() {
    const [containerCollapse, setContainerCollapse] = useState(false);

    const handleCollapse = _ => {
        setContainerCollapse(containerCollapse => !containerCollapse);
    };

    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            {/* Header */}
            <Header header="Performance Statistics" handleCollapse={handleCollapse} collapseState={containerCollapse}></Header>
            
            <StatsBody collapseState={containerCollapse}></StatsBody>

            {/* Footer */}
             <GraphFooter collapseState={containerCollapse}></GraphFooter>
        </div>
    )
}


export default StatsContainer;