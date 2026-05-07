import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // 1. Add this import
import 'bootstrap/dist/css/bootstrap.min.css'    // (If you're using Bootstrap)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 2. Wrap App here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)