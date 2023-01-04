import 'tailwindcss/tailwind.css';

import CustomNode from './components/customNode';
import GraphContainer from './components/graphContainer';
import StatsContainer from './components/statsContainer';



function App() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <GraphContainer></GraphContainer>
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <StatsContainer></StatsContainer>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-5">
        <CustomNode></CustomNode>
      </div>
    </>
  );
}

export default App;
