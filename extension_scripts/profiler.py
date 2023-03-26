import os.path
import json
import re

class profiler:
    def __init__(self):
        self.__func_dict = {}
        self.__executable = None
        self.__executable_path = None
        self.__orig_file_list = []
        self.__parse_file = ".profile_data.txt"

    # Method that gets called by the main script. Takes the executable name as an argument.
    def get_profiling_info(self, exec):
        try:
            self.__executable = os.path.abspath(exec)
        except:
            raise Exception("Invalid path to executable!")
        
        self.__executable_path = os.path.split(self.__executable)[0]
        self.__orig_file_list = os.listdir(self.__executable_path)
        self.__run_profilers()
        self.__extract_data()
        self.__create_json()
        
    
    # Runs the callgrind profiler and the executable
    def __run_profilers(self):
        profiler_cmd = "valgrind --tool=callgrind --branch-sim=yes --cache-sim=yes " + self.__executable + ">/dev/null 2>&1"
        os.system(profiler_cmd)
        callgrind_out = None
        for file in os.listdir(self.__executable_path):
            if file not in self.__orig_file_list and "callgrind.out" in file:
                callgrind_out = file
                break

        if callgrind_out == None:
            raise Exception("Please make sure valgrind is installed before proceeding!")

        output_file_cmd = "callgrind_annotate  --tree=both --inclusive=yes " + callgrind_out + " > " + self.__parse_file 
        os.system(output_file_cmd)
        os.system("rm " + callgrind_out)

    # Parse the output file and extract data
    def __extract_data(self):
        data_file = open(self.__parse_file)
        lines = data_file.readlines()

        # Regex patterns for finding specific lines
        TOTAL_DATA = re.compile(r"(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%(.*)100.0%.*PROGRAM TOTALS")
        FUNCTION_DATA = re.compile(r".*\*.*:" + re.escape(os.path.split(self.__executable)[1]) + r".*\[" + re.escape(self.__executable) + r"\].*") 
        FUNCTION_DATA_ALL = re.compile(r".*:" + re.escape(os.path.split(self.__executable)[1]) + r".*\[" + re.escape(self.__executable) + r"\].*") # Inclusive of caller/callees
        
        i = 0
        while i < len(lines):
            search =  TOTAL_DATA.match(lines[i])
            if(search != None):
                data_list = []
                for val in search.groups():
                    val = val.replace("(","").replace(")","").replace(" ","").replace(",","")
                    data_list.append(val)
                data_dict = self.__fill_data_dict(data_list)
                self.__func_dict["Totals"] = data_dict
                i += 1   
                continue

            search = FUNCTION_DATA.match(lines[i])
            if(search != None):
                data_line = re.sub(r"\(\S+\)",'',lines[i])
                data_line = re.sub(r"\(\s\S+\)",'',data_line)
                data_line = data_line.replace(".","0").replace(",","")
                data_list = data_line.split()
                func_name = data_list[14].split(os.path.split(self.__executable)[1] + "::")[-1]
                data_list = data_list[:13]
                i += 1
                while not lines[i].isspace():
                    search = FUNCTION_DATA_ALL.match(lines[i])
                    if(search != None):
                        callee_line = re.sub(r"\(\S+\)",'',lines[i])
                        callee_line = re.sub(r"\(\s\S+\)",'',callee_line)
                        callee_line = callee_line.replace(".","0").replace(",","")
                        callee_line = callee_line.split()[:13]
                        for j in range(0,13):
                            data_list[j] = str(int(data_list[j]) - int(callee_line[j]))
                    i += 1

                data_dict = self.__fill_data_dict(data_list)
                self.__func_dict[func_name] = data_dict
                i += 1
                continue   

            i += 1
        data_file.close()
            
    # Given a list of profiling data, fill it into a dictionary with the correct keys
    def __fill_data_dict(self, data_list):
        data_dict = {}
        data_keys = ["Instruction Count","Data Reads", "Data Writes", "First level I cache misses", "First level data cache read misses", "First level data cache write misses", \
                    "Last level instruction cache misses", "Last level data cache read misses", "Last level data cache write misses", "Total branches", "Branch mispredictions", \
                    "Total indirect jumps", "Indirect jump address mispredictions"]
        for i in range(0,len(data_keys)):
            data_dict[data_keys[i]] = data_list[i]

        return data_dict

    # Creates a JSON file and writes the data into it
    def __create_json(self):
        graph_data = ["L1 Data Cache Misses", "LL Data Cache Misses", "Instruction Count", "Branch mispredictions"]
        func_labels = list(self.__func_dict.keys())[1:]
        graph_dict = {}
        for dataset in graph_data:
            graph_dict[dataset] = {}
            graph_dict[dataset]["labels"] = func_labels
            graph_dict[dataset]["datasets"] = []
            graph_dict[dataset]["datasets"].append({})
            graph_dict[dataset]["datasets"][0]["label"] = dataset
            graph_data_list = []
            if dataset == "L1 Data Cache Misses":
                for func in func_labels:
                    graph_data_list.append(int(self.__func_dict[func]["First level data cache read misses"]) + int(self.__func_dict[func]["First level data cache write misses"])) 
            elif dataset == "LL Data Cache Misses":
                for func in func_labels:
                    graph_data_list.append(int(self.__func_dict[func]["Last level data cache read misses"]) + int(self.__func_dict[func]["Last level data cache write misses"]))
            else:
                for func in func_labels:
                    graph_data_list.append(int(self.__func_dict[func][dataset]))
        
            graph_dict[dataset]["datasets"][0]["data"] = graph_data_list

        with open('profiler_graphs.json', 'w') as f:
            json.dump(graph_dict, f,indent = 4,)

        with open('profiling_data.json', 'w') as f:
            json.dump(self.__func_dict, f,indent = 4,)

    def __print_info(self):
        for key in self.__func_dict.keys():
            print("---------------------------------------------------------------------------------")
            if key == "Totals":
                print("Data collected for the execution of the entire program:")
            else:
                print("Collected data for function " + key + ":")
            for data_key in self.__func_dict[key].keys(): 
                    print(data_key + ": " + self.__func_dict[key][data_key] +  " (" + str(int(int(self.__func_dict[key][data_key])*100/int(self.__func_dict["Totals"][data_key]))) + "%)")





