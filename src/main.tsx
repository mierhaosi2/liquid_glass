import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode intentionally mounts components twice in development to detect
// side-effect leaks. liquid-glass WebGL renderers don't survive this cycle
// (shader becomes null on the second init), so we run without StrictMode.
createRoot(document.getElementById('root')!).render(<App />)
