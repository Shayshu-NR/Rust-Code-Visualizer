import 'tailwindcss/tailwind.css';
import { useState } from "react";
import GraphContainer from './components/graphContainer';
import SearchBar from './components/searchBar';
import StatsContainer from './components/statsContainer';

function App() {
  const [filesResults, setFileResults] = useState([]);
  const [programTarget, setProgramTarget] = useState("");

  const setParentFileData = (childFileData) => {
    setFileResults(childFileData);
    console.log("App: ", filesResults);
  };

  const setParentProgramTarget = (childProgramTarget) => {
    setProgramTarget(childProgramTarget);
    console.log("App: ", programTarget, childProgramTarget);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <SearchBar setParentFileData={setParentFileData} setParentProgramTarget={setParentProgramTarget}></SearchBar>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <GraphContainer files={filesResults} programTarget={programTarget}></GraphContainer>
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <StatsContainer files={filesResults} programTarget={programTarget}></StatsContainer>
      </div>
    </>
  );
}

export default App;
