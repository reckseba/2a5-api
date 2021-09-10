import React from 'react';
import Input from './components/Input';
import CopyButton from './components/CopyButton';
import './App.css';


function App() {

  return (
    <div className="App">
      <header className="App-header">2a5 URL-Shortner</header>
      <section>
        <Input />
        <div id="results">
          <div id="results_link">
            <input id="result" />&nbsp;
            <a id="resultlink" href="/">Visit</a>&nbsp;
            <CopyButton />
          </div>
          <div id="results_qrcode">
            <img id="qrcode" alt="QR-Code" src="" />
          </div>
        </div>
      </section>
      <footer>© 2012-2020 2a5.de</footer>
    </div>
  );
}

export default App;
