import argparse
import configparser
import os
import pathlib
import re


def extract_config_info(proj_dir):
"""
Read Cargo.toml and filesystem to get the name of rust source files and binary names
"""
    if not os.path.isdir(proj_dir):
        raise RuntimeError(f"Given project directory is not a directory: {proj_dir}")

    toml_path = os.path.join(proj_dir, "Cargo.toml")
    if nos os.path.isfile(toml_path):
        raise RuntimeError(f"Given project directory does not contain a 'Cargo.toml' file: {proj_dir}")
    
    config = configparser.ConfigParser(allow_no_value=True)
    config.read(toml_path)

    bin_name = config['[bin']['name']
    rust_file_path = config['[bin']['path']
    if bin_name is None:
        raise RuntimeError("Given Cargo.toml file in project directory does not specify a bin name")
    
    if rust_file_path is None:
        raise RuntimeError("Given Cargo.toml file in project directory does not specify a rust file path in the [[bin]] section")
    
    return rust_file_path, bin_name

"""
Class containing information about the Rust source code file we are
generating the call graph for
"""
class RustFileDetails:
    def __init__(self, rust_file):
        self.add_file(rust_file)
        self.function_list = []
        self.function_lines = dict()
        self.get_functions()

        print(self.function_lines)

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
    
    os.remove(file_class.rust_file)

    with open(file_class.rust_file, 'w') as f:
        f.write(updated_source_code)

def execute_call_stack(proj_dir, compiler, bin_name):
"""
Execute cargo call stack and save dot file for conversion later
"""
    os.environ["RUSTC_BOOTSTRAP"] = "1"
    os.system(f"cd {proj_dir} &&" \
              f"cargo build --release --target {compiler} &&" \
              f"cargo call-stack --bin {bin_name} --target {compiler} > .rcv/graph_intermediate.dot")

def generate_call_graph(args):
    rust_file, bin_name = extract_config_info(args.proj_dir)
    file_class = RustFileDetails(rust_file)
    update_source_code(file_class)
    execute_call_stack(args.proj_dir, args.compiler, bin_name)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script to generate the call graph of a Rust source code file.")
    parser.add_argument("proj_dir", default=".", help="Directory containing Cargo.toml file and rust source files")
    #parser.add_argument("-f","--rust_file", required=True, help="Rust source code file.")
    parser.add_argument("-c", "--compiler", default="x86_64-unknown-linux-gnu", help="Compiler target to use when generating a call stack")
    args = parser.parse_args()
    generate_call_graph(args)
