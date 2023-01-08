import networkx as nx
from networkx.readwrite import json_graph
import pygraphviz as pgv
import json
import os

def process_label(label):
    """Convert label from cargo call stack into format identifying the function
    """
    return label.split('\n')[0]

def filter_graph(agraph, graph_functions):
"""Remove nodes from the call graph that do not correspond to relevant functions.

Relevant pygraphviz functions:
    Get list of all node names (numbers) : agraph.nodes()
    Delete a node by name (number) : agraph.delete_node(n)
    Get node by name (number) : agraph.get_node(n)
    Get node label : node.attr["label"]
"""
    for node in agraph.nodes():
        if process_label(agraph.get_node(node).attr["label"]) not in graph_functions:
            agraph.delete_node(node)

    return agraph #pgv.AGraph

def json_to_file(json_data, file_name="cg.json"):
    with open(f'./data/{file_name}', "w") as write_file:
        json.dump(json_data, write_file, indent=4)

file = input("Enter the file path: ")
if not os.path.isfile(file):
    raise RuntimeError(f"file '{file}' does not exist.")
G = pgv.AGraph(file)
G = filter_graph(G)
nx_graph = nx.nx_agraph.from_agraph(G)
json_to_file(json_graph.cytoscape_data(nx_graph))
