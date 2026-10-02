import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Client as Styletron } from 'styletron-engine-monolithic'
import { Provider as StyletronProvider } from 'styletron-react'
import { BaseProvider } from 'baseui'
import { theme } from './lib/theme'
import App from './App'
import './index.css'

const engine = new Styletron()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BaseProvider>
    </StyletronProvider>
  </React.StrictMode>,
)
