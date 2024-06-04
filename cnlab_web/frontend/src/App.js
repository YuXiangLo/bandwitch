import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Welcome from "./pages/Welcome";
import About from "./pages/About";
import About2 from "./pages/About2";
import NavBar from "./components/NavBar";
import { AppProvider } from './context/AppContext';

function Layout() {
  const location = useLocation();

  return (
    <>
	  <NavBar display={location.pathname === '/about' || location.pathname === '/about2' ? '' : 'none'}/>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/about" element={<About />} />
        <Route path="/about2" element={<About2 />} />
        <Route path="*" element={<Welcome />} />
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

