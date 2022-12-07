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
            { data: { id: 'one', label: 'Main()' }, position: { x: 0, y: 50 } },
            { data: { id: 'two', label: 'Fizz()' }, position: { x: 100, y: 30 } },
            { data: { id: 'three', label: 'Buzz()' }, position: { x: 120, y: 60 }}
        ],
        edges: [
            {
                data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' }
            },
            {
                data: { source : 'one', target : 'three', label : 'Edge'}
            }
        ]
    })

    console.log(elements);

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

    return (
        <div className={containerCollapseClass}>
            <CytoscapeComponent elements={elements} style={{ width: '100%', height: 'auto', minHeight: '300px', display: collapseState ? 'none' : 'block' }} stylesheet={styleSheet} layout={layout}/>
        </div>
    )
}

export default GraphBody;