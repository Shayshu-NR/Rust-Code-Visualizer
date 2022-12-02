import sys
from profiler import profiler

def main(argv):
    if(len(argv) <= 1):
        raise Exception("Incorrect usage of Script. Correct Usage is as follows-\n./code-visualizer.py [rust file]")
    if not os.path.exists(argv[1]):
        raise Exception("Invalid input file. Please make sure to use the tool with a valid rust file.")
    os.system("rustc " + argv[1])
    exec_profile = profiler()
    exec_profile.get_profiling_info(argv[1][:-3])

if __name__ == "__main__":
   main(sys.argv)