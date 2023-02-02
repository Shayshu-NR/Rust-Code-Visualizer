import { useEffect, useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import ReactLoading from 'react-loading';
import "./graph.css";
import Fuse from "fuse.js";

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

function downloadGraph(blob)
{
    let url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `Graph.png`;
    link.href = url;

    link.click();
    console.log(link);
}

function getGraphLabels(cytoData) {
    return cytoData.elements.nodes.map(x => x.data.label);
}

function GraphBody({ collapseState, programTarget, searchValue, exportGraph }) {
    //----- State -----
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);
    //-----------------

    //----- Set up -----
    let classNames = require("classnames");
    let containerLoading = classNames({
        "cursor-not-allowed": loading,
        "opacity-75": loading,
        "mx-auto": true,
        "px-2": true,
        "sm:px-6": true,
        "lg:px-8": true,
        "pb-4": true,
        "relative": true,
        "z-0": true,
    });
    const styleSheet = [
        {
            selector: "node",
            style: {
                width: "25rem",
                height: "25rem",
                shape: "circle",
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
    let cyRef = null;
    //------------------

    //----- Ref -----
    let cytoData = useRef(null);
    let cytoLabels = useRef([]);
    //---------------

    //----- Effect -----
    useEffect(() => {
        window.addEventListener("message", (event) => {
            const message = event.data;
            console.log("GraphBody Event:", event);

            switch (message.type) {
                case "graphDataResults":
                    let graphData = formatGraphData(message.value);

                    cytoData.current = graphData;
                    cytoLabels.current = getGraphLabels(message.value);

                    setElements(CytoscapeComponent.normalizeElements(graphData));
                    cyRef.elements().remove();
                    cyRef.add(CytoscapeComponent.normalizeElements(graphData));
                    cyRef.elements().layout(layout).run();
                    cyRef.center();
                    setLoading(false);
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
            setLoading(true);
            vscode.postMessage({
                type: "reqGraphData",
                value: programTarget.target.value,
            });
        }
    }, [programTarget]);

    useEffect(() => {
        console.log(`Search Value Changed:`, searchValue, cyRef);
        if (searchValue.searchValue !== undefined && cyRef !== null) {
            // clear
            if (searchValue.searchValue === "") {
                cyRef.reset();
                let resetLayout = cyRef.layout(layout);
                resetLayout.run();
            }
            else {
                let fuse = new Fuse(cytoLabels.current);
                let searchRes = fuse?.search(searchValue.searchValue);
                let searchResNames = searchRes?.map(x => x.item);
                console.log(searchRes, searchResNames, cytoLabels.current);

                cyRef.fit(cyRef.filter((ele, i) => {
                    console.log(ele._private.group);
                    return (ele._private.group === "nodes" &&
                        searchResNames.find(x => ele._private.data.label.includes(x) || x.includes(ele._private.data.label))?.length > 0);
                }));

                console.log(cyRef.filter((ele, i) => {
                    return (ele._private.group === "nodes" &&
                        searchResNames.find(x => ele._private.data.label.includes(x) || x.includes(ele._private.data.label))?.length > 0);
                }));
            }
        }
    }, [searchValue]);

    useEffect(() => {
        console.log(exportGraph, cyRef);
        if (exportGraph.target !== undefined && cyRef !== null) {
            let blob = cyRef.png({
                "output": "blob"
            });
            
            downloadGraph(blob);
        }
    }, [exportGraph]);
    //------------------

    return (
        <div className={containerLoading}>
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
                maxZoom={2}
                minZoom={0.25}
            />
            {loading ?
                <div class="absolute inset-0 flex justify-center items-center z-10 text-white">
                    <ReactLoading type={"spin"} color={"#ffffff"}></ReactLoading>
                </div> :
                null
            }
        </div>
    );
}

export default GraphBody;
