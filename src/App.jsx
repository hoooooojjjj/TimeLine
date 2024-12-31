import { BrowserRouter, Routes, Route } from "react-router-dom";
import TimelineList from "./components/TimelineList";
import Timeline from "./components/Timeline";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TimelineList />} />
        <Route path="/timeline/:id" element={<Timeline />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
