# Usage of the extension scripts

Simply run the script code_visualizer.py with a compiled rust executable as an argument.
Eg: "python3 code_visualizer.py Rust_Executable"

## Functionality of the profiler class

The profiler class runs the callgrind profiler and collects data at function granularity.

### Notes on data collection
Some calculations are performed to make sure that the collected data for any given function is EXCLUSIVE of any user-written callee functions. 
However, the data counts for any callee functions which are also library functions have been included.

The total data counts include initialization overheads, so summing up the data for the user functions won't add up to the totals.

### Storing of collected data
The collected data is currently stored in a json file called "profiling_data.json".
