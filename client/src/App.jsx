import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Checking backend...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then((res) => setStatus(`Backend says: ${res.data.status}`))
      .catch(() => setStatus('Could not reach backend'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CodeLens</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;