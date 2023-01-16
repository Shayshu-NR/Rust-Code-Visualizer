import { useEffect, useState, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './graph.css';


function GraphBody({ collapseState, programTarget }) {
    //----- State -----
    const [elements, setElements] = useState(
        {
            nodes: [],
            edges: []
        }
    );
    //-----------------

    //----- Set up -----
    let classNames = require('classnames');
    let containerCollapseClass = classNames({
        'collapse': collapseState,
        'visible': !collapseState,
        'mx-auto': !collapseState,
        'px-2': !collapseState,
        'sm:px-6': !collapseState,
        'lg:px-8': !collapseState,
        'pb-4': !collapseState
    });
    const styleSheet = [
        {
            selector: 'node',
            style: {
                width: '25rem',
                height: '25rem',
                shape: 'rectangle',
                label: "data(label)",
                color: "white"
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 5,
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#ccc',
                'curve-style': 'bezier'
            }
        }
    ];
    const layout = { name: 'grid' };
    //------------------

    //----- Ref -----
    const cyRef = useRef(null);
    //---------------

    //----- Effect -----
    useEffect(() => {
        window.addEventListener('message', event => {
            const message = event.data;
            console.log("GraphBody Event:", event);

            switch (message.type) {
                case "graphDataResults":
                    console.log(message.value);
                    break;
            }
        });

        if (programTarget.target?.value !== undefined) {
            vscode.postMessage({ type: 'reqGraphData', value: programTarget.target.value });
          }
    }, []);

    useEffect(() => {
        console.log("Program target changed: ", programTarget);
        if (programTarget.target?.value !== undefined) {
          vscode.postMessage({ type: 'reqGraphData', value: programTarget.target.value });
        }
      }, [programTarget]);
    //------------------


    return (
        <div className={containerCollapseClass}>
            <CytoscapeComponent
                elements={elements}
                style={{ width: '100%', height: 'auto', minHeight: '300px', display: collapseState ? 'none' : 'block' }}
                stylesheet={styleSheet}
                layout={layout}
                cy={cyRef}
            />
        </div>
    );
}

export default GraphBody;