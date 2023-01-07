import './App.css';
import GraphContainer from './components/graphContainer';
import SearchBar from './components/searchBar';
import StatsContainer from './components/statsContainer';



function App() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <SearchBar></SearchBar>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <GraphContainer></GraphContainer>
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <StatsContainer></StatsContainer>
      </div>
    </>
  );
}

export default App;
