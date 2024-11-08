// src/App.tsx
import React from 'react';
import './App.css';
import FtcLiveConnectionManager from './components/FtcLiveConnectionManager';
import { FtcLiveProvider } from './contexts/FtcLiveContext';
import { ObsStudioProvider } from './contexts/ObsStudioContext';
import ObsStudioManager from './components/ObsStudioConnectionManager';
import SceneMapper from './components/SceneMapper';
import MatchEventsTable from './components/MatchEventsTable';
import BrowserSourceUpdater from './components/BrowserSourceUpdater'

function App() {
  return (
    <ObsStudioProvider>
    <FtcLiveProvider>
    <div className="App">
      <header className="App-header">
        <h1>OBS WebSocket Client</h1>
      </header>
        <FtcLiveConnectionManager />
        <ObsStudioManager />
        <BrowserSourceUpdater />
        <SceneMapper />
        <MatchEventsTable />
    </div>
    </FtcLiveProvider>
    </ObsStudioProvider>
  );
}

export default App;
