import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import About from "./pages/About";
import About2 from "./pages/About2";
import About3 from "./pages/About3";
import NavBar from "./components/NavBar";
import { AppProvider } from './context/AppContext';

function Layout() {
  const location = useLocation();

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/about2" element={<About2 />} />
        <Route path="/about3" element={<About3 />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}

function App() {
  return (
	<AppProvider>
      <Router>
        <Layout />
      </Router>
	</AppProvider>
  );
}

export default App;

