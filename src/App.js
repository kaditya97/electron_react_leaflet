import React, { Component } from 'react';
import './App.css';
import Map from './components/Map';
// const {app} = window.require('electron').remote;

class App extends Component {
  render() {
    return (
      <div>
      <Map />
      </div>
    );
  }
}

export default App;
