import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// React DevToolsを本番環境で無効化
if (import.meta.env.PROD) {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    // @ts-ignore
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = undefined;
    // @ts-ignore
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = undefined;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)