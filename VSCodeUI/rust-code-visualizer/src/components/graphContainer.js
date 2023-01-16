import '../input.css';
import {useState} from 'react';
import GraphFooter from './graphFooter.js';
import GraphBody from './graphBody';
import Header from './header';



function GraphContainer({filesResults, programTarget}) {
    const [containerCollapse, setContainerCollapse] = useState(false);

    const handleCollapse = _ => {
        setContainerCollapse(containerCollapse => !containerCollapse);
    };

    return (
        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            {/* Header */}
            <Header header="Call Graph" handleCollapse={handleCollapse} collapseState={containerCollapse}></Header>
                
            {/* Body */}
            <GraphBody collapseState={containerCollapse} programTarget={programTarget}></GraphBody>

            {/* Footer */}
             <GraphFooter collapseState={containerCollapse}></GraphFooter>
        </div>
    );
}

export default GraphContainer;