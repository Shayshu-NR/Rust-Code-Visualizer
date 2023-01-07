def dot_to_json(file_in):
    import networkx
    from networkx.readwrite import json_graph
    import pydot
    graph_netx = networkx.drawing.nx_pydot.read_dot(file_in)
    graph_json = json_graph.node_link_data( graph_netx )
    return json_graph.node_link_data(graph_netx)

def json_to_file(json_data, file_name="cg.json"):
    import json
    with open(f'./data/{file_name}', "w") as write_file:
        json.dump(json_data, write_file, indent=4)

file = input("Enter the file path:")
json_to_file(dot_to_json(file))