import argparse
import networkx as nx
from networkx.readwrite import json_graph
import pygraphviz as pgv
import json
import os
import pathlib
import re
import subprocess


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
    
    # Extract target binary and file information
    bin_name = None
    rust_file_path = None
    with open(toml_path, 'r') as toml_file:
        found_bin = False
        contains_bin = re.compile(r"\[\[bin\]\]")
        contains_section = re.compile(r"\[\s*\[?[a-zA-Z0-9._]+\]?\s*\]")
        extract_attr = re.compile(r"([a-zA-Z]+)\s+=\s+\"(\S+)\"")
        for line in toml_file:
            # seek until you find the [[bin]] section
            if not found_bin:
                if contains_bin.search(line):
                    found_bin = True
                continue
            
            # Check for when the [[bin]] section ends
            if contains_section.search(line):
                break
            
            # extract bin name and file path
            match = extract_attr.search(line)
            if match:
                if match.group(1) == "name":
                    bin_name = match.group(2)
                elif match.group(1) == "path":
                    rust_file_path = match.group(2)
        
        if not found_bin:
            raise RuntimeError("Given Cargo.toml file in project directory does not specify a [[bin]] section")

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


class RustFileDetails:
    """
    Class containing information about the Rust source code file we are
    generating the call graph for
    """

    def __init__(self, rust_file, proj_dir):
        self.proj_dir = proj_dir
        self.add_file(rust_file)
        self.function_list = []
        self.function_lines = dict()
        self.get_functions()
        self.reformat_source_code()

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
    

    def reformat_source_code(self):
        """
        Insert an inline(never) trait in front of all user functions so they are not optimized away 
        """
        trait_regex_pattern = re.compile(r"#\s*\[\s*inline\s*(?:\([\w\s]*\))?\s*\]")
        fn_regex_pattern = re.compile(r"((?:\w+\s+)?fn\s+[\w]+?)\s*\(")
        main_regex_pattern = re.compile(r"fn\s+main\s*\(")
        
        code_list = self.source_code.split('\n')
        new_lines = []
        skip_next_fn = False
        for line in code_list:
            match = trait_regex_pattern.search(line)
            if match:
                skip_next_fn = True
            
            match = main_regex_pattern.search(line)
            if match:
                new_lines.append(line)
                continue

            match = fn_regex_pattern.search(line)
            if match and skip_next_fn:
                new_lines.append(line)
                skip_next_fn = False
            elif match:
                original_fn = match.group(1)
                fn_start = line.find(original_fn)
                ammended = line[:fn_start] + "#[inline(never)]\n" + line[fn_start:]
                new_lines.append(ammended)
            else:
                new_lines.append(line)
        self.source_code = '\n'.join(new_lines)


def update_source_code(file_class):
    """
    Updating the Rust source code file so that the call graph contains information
    about the relevant functions
    """
    # code_list = file_class.source_code.split('\n')

    # inserted = 0
    # for func in file_class.function_lines:
    #     idx = file_class.function_lines[func]
    #     if code_list[idx + inserted - 1] != '#[inline(never)]':
    #         code_list.insert(idx + inserted, '#[inline(never)]')
    #         inserted += 1

    # updated_source_code = ''
    # for idx, line in enumerate(code_list):
    #     updated_source_code += line
    #     if idx != (len(code_list) - 1):
    #         updated_source_code += '\n'
    
    # move file to data storage dir instead of deleting
    file_name = os.path.basename(file_class.rust_file)
    backup_path = os.path.join(file_class.proj_dir, OUTDIR_NAME, file_name + ".bk")
    os.replace(file_class.rust_file, backup_path)

    with open(file_class.rust_file, 'w') as f:
        f.write(file_class.source_code)


def execute_call_stack(proj_dir, compiler, bin_name):
    """Execute cargo call stack and save dot file for conversion later
    """
    os.environ["RUSTC_BOOTSTRAP"] = "1"
    dot_data = None
    
    home_path = os.environ.copy()["HOME"]
    cargo_path = os.path.join(home_path, ".cargo", "bin", "cargo")

    try:
        process_output = subprocess.run([cargo_path, "build", "--release", "--target", compiler],
                                            capture_output=True, check=True, cwd=proj_dir, encoding="utf-8")
        process_output = subprocess.run([cargo_path, "call-stack", "--bin", bin_name, "--target", compiler],
                                            capture_output=True, check=True, cwd=proj_dir, encoding="utf-8")
        dot_data = process_output.stdout
    except subprocess.CalledProcessError as e:
        print("Compilation of Rust source code Failed!\n" + e.stderr)
        exit(1)

    intermediate_file_path = os.path.join(proj_dir, OUTDIR_NAME, DOT_INTERMEDIATE_NAME)
    with open(intermediate_file_path, "w") as intermediate_file:
        intermediate_file.write(dot_data)
    
    return dot_data


def process_label(label):
    """Convert label from cargo call stack into format identifying the function
    """
    match = re.search(r"((?:[a-zA-Z0-9_<>,]*\:\:)*[a-zA-Z0-9_<>,]*)$", label.split('\\')[0])
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


def convert_to_json(dot_data, file_class, bin_name, output_path):
    """Take input dot file from cargo call stack and convert it into the cytoscape.js file format
    """
    G = pgv.AGraph(dot_data)
    G = filter_graph(G, file_class.function_list, bin_name)
    nx_graph = nx.nx_agraph.from_agraph(G)
    json_to_file(json_graph.cytoscape_data(nx_graph),
                 file_path=output_path)


def generate_call_graph(args):
    rust_file, bin_name = extract_config_info(args.proj_dir)
    file_class = RustFileDetails(rust_file, args.proj_dir)
    update_source_code(file_class)
    dot_data = execute_call_stack(args.proj_dir, args.compiler, bin_name)
    if not args.output_path:
        output_path = os.path.join(file_class.proj_dir, OUTDIR_NAME, CYTO_OUTPUT_NAME)
    else:
        output_path = args.output_path
    convert_to_json(dot_data, file_class, bin_name, output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script to generate the call graph of a Rust source code file.")
    parser.add_argument("-p", "--proj_dir", default=".", help="Directory containing Cargo.toml file and rust source files")
    #parser.add_argument("-f","--rust_file", required=True, help="Rust source code file.")
    parser.add_argument("-c", "--compiler", default="x86_64-unknown-linux-gnu", help="Compiler target to use when generating a call stack")
    parser.add_argument("-o","--output_path",help="Path to store output cytoscape JSON file")
    args = parser.parse_args()
    generate_call_graph(args)
