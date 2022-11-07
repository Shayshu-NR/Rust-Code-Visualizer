import cytoscape from 'cytoscape'
import './graph.css'


function GraphBody() {
    var cyContainer = document.getElementById("cy");
    var cytoscape = require('cytoscape');

    try {
        var cy = cytoscape({
            container: cyContainer,
            elements: {
                nodes: [
                    {
                        data: { id: 'a' }
                    },

                    {
                        data: { id: 'b' }
                    }
                ],
                edges: [
                    {
                        data: { id: 'ab', source: 'a', target: 'b' }
                    }
                ]
            },

            layout: {
                name: 'grid',
                rows: 1
            },

            // so we can see the ids
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(id)'
                    }
                }
            ]
        });

        cy.unmount();
        cy.mount(cyContainer);

        console.log(cy.destroyed());
    }
    catch (ex) {
        console.log(ex);
    }

    return (
        <div id="cy" className="container cy">

        </div>
    )

}

export default GraphBody;