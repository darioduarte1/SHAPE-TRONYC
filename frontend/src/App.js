import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Home from './pages/Home';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/" element={<Home />} />
          </Routes>
      </Router>
  );
}

export default App;