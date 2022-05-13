import logo from './logo.svg';
import './App.css';
import {NonogramApp} from './NonApp.js';
import {BrowserRouter as Router} from "react-router-dom";

function App() {
  return (

    <Router>
      <NonogramApp />
    </Router>
  );
}

export default App;
