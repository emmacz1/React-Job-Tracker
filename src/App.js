// src/App.js
import React from 'react';
import { AuthProvider } from './auth/auth';
import Login from './auth/login';
import Welcome from './components/Welcome';
import SnapshotFirebaseAdvanced from './components/SnapshotFirebaseAdvanced';

function App() {
    return (
        <AuthProvider>
            <Welcome />
            <Login />
            <SnapshotFirebaseAdvanced />
        </AuthProvider>
    );
}

export default App;
