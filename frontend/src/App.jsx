import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Admin from "./pages/Admin";
import Ranking from "./pages/Ranking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ranking" />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/central-var" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;