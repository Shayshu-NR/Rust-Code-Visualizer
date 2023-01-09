import os;

__current_path = os.path.abspath("./")
__orig_file_list = os.listdir(__current_path)

print(os.path.abspath("/mnt/d/Capstone/Rust-Code-Visualizer/cargo-call-stack/example/addingafile.rs"))
print(os.path.split("/mnt/d/Capstone/Rust-Code-Visualizer/cargo-call-stack/example/addingafile.rs")[0])