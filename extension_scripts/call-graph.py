import argparse
import os
import pathlib
import re

class RustFileDetails:
    def __init__(self, rust_file):
        self.add_file(rust_file)
        self.function_list = []
        self.get_functions()

    def add_file(self, rust_file):
        if not os.path.isfile(rust_file):
            raise RuntimeError(f"File specidied does not exist {rust_file}")

        if (pathlib.Path(rust_file).suffix != ".rs"):
            raise RuntimeError(f"{rust_file} is not a Rust source code file")

        self.rust_file = rust_file

    def get_functions(self):
        with open(self.rust_file, 'r') as f:
            for line in f:
                if 'fn' in line:
                    regexPattern = "fn " + '(.+?)' + '\('
                    func_name = re.search(regexPattern, line).group(1)
                    if func_name != 'main':
                        self.function_list.append(func_name)

            f.seek(0)
            self.source_code = f.read()


def generate_call_graph(rust_file):
    file_class = RustFileDetails(rust_file)
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script to generate the call graph of a Rust source code file.")
    parser.add_argument("-f","--rust_file", required=True, help="Rust source code file.")
    args = parser.parse_args()
    generate_call_graph(args.rust_file)