import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import Decoy from './components/Decoy.jsx'
import './index.css'
import { initAppearance } from './lib/appearance.js'

/* Sozlamalar → Mavzu (sinov) */
initAppearance()

const root = createRoot(document.getElementById('root'))

function openApp() {
  root.render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  )
}

/* Electron asosiy oynasi (tashqi Edge niqobida parol kiritilgandan keyin) ?unlocked=1
   bilan yuklaydi — bu holda ichki niqob qayta so'ralmaydi. Aks holda (brauzerda
   ochilganda) avval Edge niqobi — 3 ta probel + Enter dan keyin ilova. */
if (new URLSearchParams(location.search).get('unlocked') === '1') {
  openApp()
} else {
  root.render(
    <StrictMode>
      <Decoy onUnlock={openApp} />
    </StrictMode>,
  )
}
