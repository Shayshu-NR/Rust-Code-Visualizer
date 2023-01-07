import sys
from profiler import profiler

def main(argv):
    if(len(argv) <= 1):
        raise Exception("Incorrect usage of Script. Correct Usage is as follows-\n./code-visualizer.py [rust executable]")
    exec_profile = profiler()
    exec_profile.get_profiling_info(argv[1])

if __name__ == "__main__":
   main(sys.argv)