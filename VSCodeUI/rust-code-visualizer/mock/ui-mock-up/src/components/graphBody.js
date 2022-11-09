import CytoscapeComponent from 'react-cytoscapejs';
import './graph.css'


function GraphBody({ collapseState }) {
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


    const elements = CytoscapeComponent.normalizeElements({
        nodes: [
            { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
            { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } }
        ],
        edges: [
            {
                data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' }
            }
        ]
    })

    const styleSheet = [
        {
            selector: "node",
            style: {
                backgroundColor: "white",
                width: 30,
                height: 30
            }
        }
    ];


    return (
        <div className={containerCollapseClass}>
            <CytoscapeComponent elements={elements} style={{ width: '100%', height: '600px', display: collapseState ? 'none' : 'block' }} stylesheet={styleSheet} />
        </div>
    )
}

export default GraphBody;