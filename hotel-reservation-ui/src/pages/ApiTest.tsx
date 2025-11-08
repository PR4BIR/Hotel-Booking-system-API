// filepath: d:\hotel\hotel-reservation-ui\src\pages\ApiTest.tsx
import React, { useState } from 'react';
import axios from 'axios';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [endpoint, setEndpoint] = useState<string>('/');
  const [loading, setLoading] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>('http://127.0.0.1:8000');

  const testEndpoint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}${endpoint}`);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}\n${error.response ? JSON.stringify(error.response.data, null, 2) : ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">API Connection Tester</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Base URL:</label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint:</label>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <button
        onClick={testEndpoint}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? 'Testing...' : 'Test Endpoint'}
      </button>
      
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">{result}</pre>
        </div>
      )}
      
      <div className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Common Endpoints to Test:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><button className="text-blue-600 hover:underline" onClick={() => setEndpoint('/')}>Root (/)</button></li>
          <li><button className="text-blue-600 hover:underline" onClick={() => setEndpoint('/health')}>Health Check (/health)</button></li>
          <li><button className="text-blue-600 hover:underline" onClick={() => setEndpoint('/api/rooms')}>Rooms (/api/rooms)</button></li>
          <li><button className="text-blue-600 hover:underline" onClick={() => setEndpoint('/api/auth/login')}>Login (/api/auth/login)</button></li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;