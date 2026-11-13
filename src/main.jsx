import React from 'react'
import ReactDOM from 'react-dom/client'

// Self-hosted variable fonts, no third-party requests, no FOUT.
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/noto-sans-tamil'

import './styles/index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
