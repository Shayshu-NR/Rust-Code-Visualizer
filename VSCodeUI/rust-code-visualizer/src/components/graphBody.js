import { useEffect, useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import "./graph.css";

function formatGraphData(cytoData) {
    let retElements = [];

    // Nodes
    cytoData.elements.nodes.forEach((x) =>
        retElements.push({
            group: "nodes",
            data: x.data,
        })
    );

    // Edges
    cytoData.elements.edges.forEach((x) =>
        retElements.push({
            group: "edges",
            data: {
                id: x.id,
                source: x.data.source,
                target: x.data.target,
            },
        })
    );

    return retElements;
}

function GraphBody({ collapseState, programTarget, searchValue}) {
    //----- State -----
    const [elements, setElements] = useState([]);
    //-----------------

    //----- Set up -----
    let classNames = require("classnames");
    let containerCollapseClass = classNames({
        collapse: collapseState,
        visible: !collapseState,
        "mx-auto": !collapseState,
        "px-2": !collapseState,
        "sm:px-6": !collapseState,
        "lg:px-8": !collapseState,
        "pb-4": !collapseState,
    });
    const styleSheet = [
        {
            selector: "node",
            style: {
                width: "25rem",
                height: "25rem",
                shape: "rectangle",
                label: "data(label)",
                color: "white",
            },
        },
        {
            selector: "edge",
            style: {
                width: 5,
                "target-arrow-shape": "triangle",
                "target-arrow-color": "#ccc",
                "curve-style": "bezier",
            },
        },
    ];
    const layout = { name: "breadthfirst" };
    let cyRef;
    //------------------

    //----- Ref -----
    //---------------

    //----- Effect -----
    useEffect(() => {
        window.addEventListener("message", (event) => {
            const message = event.data;
            console.log("GraphBody Event:", event);

            switch (message.type) {
                case "graphDataResults":
                    let graphData = formatGraphData(message.value);
                    setElements(CytoscapeComponent.normalizeElements(graphData));
                    cyRef.elements().remove();
                    cyRef.add(CytoscapeComponent.normalizeElements(graphData));
                    cyRef.elements().layout(layout).run();
                    cyRef.center();

                    console.log(cyRef.data());
                    console.log(cyRef.elements());
                    console.log(cyRef);
                    break;
            }
        });

        if (programTarget.target?.value !== undefined) {
            vscode.postMessage({
                type: "reqGraphData",
                value: programTarget.target.value,
            });
        }
    }, []);

    useEffect(() => {
        console.log("Program target changed: ", programTarget);
        if (programTarget.target?.value !== undefined) {
            vscode.postMessage({
                type: "reqGraphData",
                value: programTarget.target.value,
            });
        }
    }, [programTarget]);

    useEffect(() => {
        console.log(`Search Value Changed ${searchValue}`);
    }, [searchValue]);
    //------------------

    return (
        <div className={containerCollapseClass}>
            <CytoscapeComponent
                elements={elements}
                style={{
                    width: "100%",
                    height: "auto",
                    minHeight: "300px",
                    display: collapseState ? "none" : "block",
                }}
                stylesheet={styleSheet}
                layout={layout}
                cy={(cy) => {
                    cyRef = cy;
                }}
            />
        </div>
    );
}

export default GraphBody;
