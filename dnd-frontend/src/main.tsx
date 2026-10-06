import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { MantineProvider } from '@mantine/core'
import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './styles/glassyInput.css'
import './styles/index.css'
import './styles/theme.css'
import './styles/themes/index.css'
import './styles/loaders.css'
import './styles/sitePrefs.css'
import './styles/adminCyber.css'
import { BrowserRouter } from 'react-router-dom'
import { SignalRProvider } from './SignalR/SignalRProvider.tsx'
import { registerAuthStoreGuards } from '@store/authStoreGuards'
import { mantineTheme } from './styles/mantineTheme'

registerAuthStoreGuards();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark" theme={mantineTheme}>
      {/* Router above SignalR so hub notifications (table invites) can navigate */}
      <BrowserRouter>
        <SignalRProvider>
          <App />
        </SignalRProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
)
