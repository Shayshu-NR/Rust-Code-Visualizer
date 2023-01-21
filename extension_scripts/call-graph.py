import argparse
import configparser
import networkx as nx
from networkx.readwrite import json_graph
import pygraphviz as pgv
import json
import os
import pathlib
import re


OUTDIR_NAME = ".rcv/"
DOT_INTERMEDIATE_NAME = "inter.dot"
CYTO_OUTPUT_NAME = "cyto.json"


def extract_config_info(proj_dir):
    """Read Cargo.toml and filesystem to get the name of rust source files and binary names
    """
    if not os.path.isdir(proj_dir):
        raise RuntimeError(f"Given project directory is not a directory: {proj_dir}")

    toml_path = os.path.join(proj_dir, "Cargo.toml")
    if not os.path.isfile(toml_path):
        raise RuntimeError(f"Given project directory does not contain a 'Cargo.toml' file: {proj_dir}")
    
    config = configparser.ConfigParser(allow_no_value=True)
    config.read(toml_path)

    bin_name = config['[bin']['name']
    rust_file_path = config['[bin']['path']
    if bin_name is None:
        raise RuntimeError("Given Cargo.toml file in project directory does not specify a bin name")
    
    if rust_file_path is None:
        raise RuntimeError("Given Cargo.toml file in project directory does not specify a rust file path in the [[bin]] section")
    
    bin_name = bin_name.strip("\"'")
    rust_file_path = os.path.join(proj_dir, rust_file_path.strip("\"'"))
    
    # Create a directory for intermediate files
    intermediate_storage_dir = os.path.join(proj_dir, OUTDIR_NAME)
    if os.path.isfile(intermediate_storage_dir):
        raise RuntimeError(f"{intermediate_storage_dir} configuration is invalid. Should be directory")
    
    if not os.path.exists(intermediate_storage_dir):
        os.makedirs(intermediate_storage_dir)

    return rust_file_path, bin_name

"""
Class containing information about the Rust source code file we are
generating the call graph for
"""
class RustFileDetails:
    def __init__(self, rust_file, proj_dir):
        self.proj_dir = proj_dir
        self.add_file(rust_file)
        self.function_list = []
        self.function_lines = dict()
        self.get_functions()

    def add_file(self, rust_file):
        if not os.path.isfile(rust_file):
            raise RuntimeError(f"File specified does not exist: {rust_file}")

        if (pathlib.Path(rust_file).suffix != ".rs"):
            raise RuntimeError(f"{rust_file} is not a Rust source code file")

        self.rust_file = rust_file

    def get_functions(self):
        regex_pattern = re.compile(r"fn\s+([a-zA-Z0-9_]+?)\s*\(")
        
        with open(self.rust_file, 'r') as f:
            i = 0
            for line in f:
                match = regex_pattern.search(line)
                if match:
                    func_name = match.group(1)
                    if func_name != 'main':
                        self.function_list.append(func_name)
                        self.function_lines[func_name] = i
                i += 1

            f.seek(0)
            self.source_code = f.read()

"""
Updating the Rust source code file so that the call graph contains information
about the relevant functions
"""
def update_source_code(file_class):
    code_list = file_class.source_code.split('\n')

    inserted = 0
    for func in file_class.function_lines:
        idx = file_class.function_lines[func]
        if code_list[idx + inserted - 1] != '#[inline(never)]':
            code_list.insert(idx + inserted, '#[inline(never)]')
            inserted += 1

    updated_source_code = ''
    for idx, line in enumerate(code_list):
        updated_source_code += line
        if idx != (len(code_list) - 1):
            updated_source_code += '\n'
    
    # move file to data storage dir instead of deleting
    file_name = os.path.basename(file_class.rust_file)
    os.replace(file_class.rust_file, os.path.join(file_class.proj_dir, OUTDIR_NAME, file_name + ".bk"))

    with open(file_class.rust_file, 'w') as f:
        f.write(updated_source_code)

def execute_call_stack(proj_dir, compiler, bin_name):
    """Execute cargo call stack and save dot file for conversion later
    """
    os.environ["RUSTC_BOOTSTRAP"] = "1"
    os.system(f"cd {proj_dir} &&" \
              f"cargo build --release --target {compiler} &&" \
              f"cargo call-stack --bin {bin_name} --target {compiler} > {OUTDIR_NAME}{DOT_INTERMEDIATE_NAME}")

def process_label(label):
    """Convert label from cargo call stack into format identifying the function
    """
    match = re.search(r"((?:[a-zA-Z0-9_]*\:\:)*[a-zA-Z0-9_]*)$", label.split('\\')[0])
    if not match:
        raise RuntimeError(f"Label {label} could not match to a function name")
    return match.group(1)

def filter_graph(agraph, graph_functions, bin_name):
    """Remove nodes from the call graph that do not correspond to relevant functions.

    Relevant pygraphviz functions:
        Get list of all node names (numbers) : agraph.nodes()
        Delete a node by name (number) : agraph.delete_node(n)
        Get node by name (number) : agraph.get_node(n)
        Get node label : node.attr["label"]
    """
    graph_functions.append("main")
    
    for node in agraph.nodes():
        label = process_label(agraph.get_node(node).attr["label"])
        if any(label.endswith(func) and label.startswith(bin_name) for func in graph_functions):
            agraph.get_node(node).attr["label"] = label
        else:
            agraph.delete_node(node)
    
    return agraph #pgv.AGraph

def json_to_file(json_data, file_path=CYTO_OUTPUT_NAME):
    with open(file_path, "w") as write_file:
        json.dump(json_data, write_file, indent=4)

def convert_to_json(file_class, bin_name, output_path):
    """Take input dot file from cargo call stack and convert it into the cytoscape.js file format
    """
    dot_file = os.path.join(file_class.proj_dir, OUTDIR_NAME, DOT_INTERMEDIATE_NAME)
    G = pgv.AGraph(dot_file)
    G = filter_graph(G, file_class.function_list, bin_name)
    nx_graph = nx.nx_agraph.from_agraph(G)
    json_to_file(json_graph.cytoscape_data(nx_graph),
                 file_path=output_path)

def generate_call_graph(args):
    rust_file, bin_name = extract_config_info(args.proj_dir)
    file_class = RustFileDetails(rust_file, args.proj_dir)
    update_source_code(file_class)
    execute_call_stack(args.proj_dir, args.compiler, bin_name)
    if not args.output_path:
        output_path = os.path.join(file_class.proj_dir, OUTDIR_NAME, CYTO_OUTPUT_NAME)
    else:
        output_path = args.output_path
    convert_to_json(file_class, bin_name, output_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script to generate the call graph of a Rust source code file.")
    parser.add_argument("-p", "--proj_dir", default=".", help="Directory containing Cargo.toml file and rust source files")
    #parser.add_argument("-f","--rust_file", required=True, help="Rust source code file.")
    parser.add_argument("-c", "--compiler", default="x86_64-unknown-linux-gnu", help="Compiler target to use when generating a call stack")
    parser.add_argument("-o","--output_path",help="Path to store output cytoscape JSON file")
    args = parser.parse_args()
    generate_call_graph(args)
