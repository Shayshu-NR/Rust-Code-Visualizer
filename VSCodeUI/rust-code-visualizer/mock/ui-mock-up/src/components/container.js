import '../input.css';
import GraphFooter from './graphFooter.js';
import GraphBody from './graphBody';
import GraphHeader from './graphHeader';


function Container() {
    return (
        <div className="container mx-auto rounded bg-gray-700 border-slate-600">
            {/* Header */}
            <GraphHeader props={{}}></GraphHeader>
                
            {/* Body */}
            <GraphBody></GraphBody>


            {/* Footer */}
             <GraphFooter></GraphFooter>
        </div>
    )
}

export default Container;