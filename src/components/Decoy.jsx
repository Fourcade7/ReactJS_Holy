import { useEffect, useRef, useState } from 'react'
import './Decoy.css'

/* Edge "Новая вкладка" niqobi — ElectronJS_Holy/decoy/index.html ning web nusxasi.
   3 ta probel + Enter → Qur'on, boshqa matn → shu vkladkada Bing/sayt ochiladi. */

const IMG = `${import.meta.env.BASE_URL}decoy/img/`

const QUICK = [
  ['m365', 'Microsoft 365', 'https://www.microsoft365.com/', true],
  ['booking', 'Booking.com', 'https://www.booking.com/', true],
  ['kayak', 'Kayak', 'https://www.kayak.com/', true],
  ['ebay', 'eBay', 'https://www.ebay.com/', false],
  ['aliexpress', 'AliExpress', 'https://www.aliexpress.com/', false],
  ['facebook', 'Facebook', 'https://www.facebook.com/', true],
  ['outlook', 'Outlook', 'https://outlook.live.com/', true],
  ['linkedin', 'Linkedin', 'https://www.linkedin.com/', false],
  ['add', 'Add shortcut', null, true],
]

/* Haqiqiy Edge F11 yoki o'rnatilgan ilova oynasida bo'lsa o'z panelini ko'rsatmaydi */
const FULLSCREEN = '(display-mode: fullscreen), (display-mode: standalone)'
const isFramed = () =>
  matchMedia(FULLSCREEN).matches || (innerWidth >= screen.width && innerHeight >= screen.height)

/* Electron'da haqiqiy Edge ochilardi — webda shu vkladkaning o'zi o'tadi */
function navigate(input) {
  const looksLikeUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) || (!/\s/.test(input) && /\.|^localhost/i.test(input))
  const target = !input ? '' : looksLikeUrl ? input : `https://www.bing.com/search?q=${encodeURIComponent(input)}`
  location.href = /^[a-z]+:\/\//i.test(target) ? target : `https://${target || 'www.bing.com'}`
}

function closeTab() {
  window.close()
  location.replace('about:blank')
}

function Icon({ name, at: [left, top, size], retina = true }) {
  const src = `${IMG}${name}.png`
  return (
    <img
      src={src}
      srcSet={retina ? `${src} 1x, ${IMG}${name}@2x.png 2x` : undefined}
      style={{ left, top, width: size, height: size }}
      alt=""
    />
  )
}

export default function Decoy({ onUnlock }) {
  const [framed, setFramed] = useState(isFramed)
  const [background] = useState(() => `${IMG}bg${1 + Math.floor(Math.random() * 10)}.jpg`)
  const omniRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const update = () => setFramed(isFramed())
    addEventListener('resize', update)
    return () => removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    ;(framed ? omniRef : searchRef).current?.focus()
  }, [framed])

  function onKeyDown(e) {
    if (e.key !== 'Enter') return
    const value = e.target.value
    if (value === '   ') return onUnlock()
    if (value.trim()) navigate(value.trim())
  }

  return (
    <div className={framed ? 'decoy framed' : 'decoy'}>
      <div className="chrome">
        <div id="strip">
          <button id="tab-actions"><Icon name="tab-actions" at={[8, 8, 16]} /></button>
          <div id="tab">
            <Icon name="tab-favicon" at={[8, 8, 16]} />
            <div id="tab-title">Новая вкладка</div>
            <button id="tab-close" onClick={closeTab}><Icon name="tab-close" at={[2, 2, 16]} /></button>
          </div>
          <button id="new-tab" onClick={() => navigate('')}><Icon name="new-tab" at={[6, 5, 20]} /></button>
        </div>

        <button id="back" className="tb"><Icon name="back" at={[8, 6, 20]} /></button>
        <button id="refresh" className="tb" onClick={() => location.reload()}><Icon name="refresh" at={[8, 6, 20]} /></button>
        <div
          id="omnibox"
          onMouseDown={(e) => {
            if (e.target !== omniRef.current) {
              e.preventDefault()
              omniRef.current.focus()
            }
          }}
        >
          <Icon name="omni-search" at={[7, 7, 16]} />
          <input ref={omniRef} type="text" spellCheck="false" autoComplete="off" onKeyDown={onKeyDown} />
        </div>
        <button id="fav-star" className="tb"><Icon name="fav-star" at={[8, 6, 20]} /></button>
        <button id="avatar" className="tb"><Icon name="avatar" at={[3, 1, 30]} /></button>
        <button id="more" className="tb"><Icon name="more" at={[8, 6, 20]} /></button>
        <button id="copilot"><Icon name="copilot-logo" at={[5, 6, 24]} /><span>Чат</span></button>
        <button id="copilot-more"><Icon name="copilot-chevron" at={[4, 9, 16]} retina={false} /></button>

        <button id="fav-left"><Icon name="fav-left" at={[6, 4, 20]} /></button>
        <button id="fav-import"><Icon name="fav-import" at={[6, 4, 20]} /><span>Импорт избранного</span></button>
        <div id="fav-sep" />
        <div id="fav-msg">
          Для быстрого доступа поместите избранные элементы на панель "Избранное". <a>Управление избранным</a>
        </div>
      </div>

      <div id="page" style={{ backgroundImage: `url('${background}')` }}>
        <button id="waffle"><svg viewBox="0 0 20 20"><g><circle cx="3" cy="3" r="1.6"/><circle cx="10" cy="3" r="1.6"/><circle cx="17" cy="3" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="17" cy="10" r="1.6"/><circle cx="3" cy="17" r="1.6"/><circle cx="10" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/></g></svg></button>
        <button id="pencil"><svg viewBox="0 0 24 24"><path d="M20.95 3.05a3.58 3.58 0 0 0-5.06 0L3.94 15c-.4.4-.7.92-.82 1.48l-1.1 4.6a.75.75 0 0 0 .9.9l4.6-1.1A3.1 3.1 0 0 0 9 20.07L20.95 8.11a3.58 3.58 0 0 0 0-5.06Zm-4 1.06a2.08 2.08 0 1 1 2.94 2.94l-.89.89L16.06 5l.9-.9ZM15 6.06 17.94 9l-10 10a1.6 1.6 0 0 1-.76.43l-3.42.8.82-3.4c.06-.3.21-.56.42-.77l10-10Z"/></svg></button>
        <button id="gear"><svg viewBox="0 0 24 24"><path d="M12.01 2.25c.74 0 1.47.1 2.18.25.32.07.55.33.59.65l.17 1.53a1.38 1.38 0 0 0 1.92 1.11l1.4-.61c.3-.13.64-.06.85.17a9.8 9.8 0 0 1 2.2 3.8c.1.3 0 .63-.26.82l-1.25.92a1.38 1.38 0 0 0 0 2.22l1.25.92c.26.19.36.52.27.82a9.8 9.8 0 0 1-2.2 3.8.75.75 0 0 1-.85.17l-1.4-.62a1.38 1.38 0 0 0-1.93 1.12l-.17 1.52a.75.75 0 0 1-.58.65 9.52 9.52 0 0 1-4.4 0 .75.75 0 0 1-.57-.65l-.17-1.52a1.38 1.38 0 0 0-1.93-1.11l-1.4.62a.75.75 0 0 1-.85-.18 9.8 9.8 0 0 1-2.2-3.8c-.1-.3 0-.63.26-.82l1.25-.92a1.38 1.38 0 0 0 0-2.22l-1.24-.92a.75.75 0 0 1-.28-.82 9.8 9.8 0 0 1 2.2-3.8c.23-.23.57-.3.86-.17l1.4.62c.4.17.86.15 1.25-.08.38-.22.63-.6.68-1.04l.17-1.53a.75.75 0 0 1 .58-.65c.72-.16 1.45-.24 2.2-.25Zm0 1.5c-.45 0-.9.04-1.35.12l-.11.97a2.89 2.89 0 0 1-4.03 2.33l-.9-.4A8.3 8.3 0 0 0 4.29 9.1l.8.59a2.88 2.88 0 0 1 0 4.64l-.8.59a8.3 8.3 0 0 0 1.35 2.32l.9-.4a2.88 2.88 0 0 1 4.02 2.32l.1.99c.9.15 1.8.15 2.7 0l.1-.99a2.88 2.88 0 0 1 4.02-2.32l.9.4a8.3 8.3 0 0 0 1.35-2.32l-.8-.59a2.88 2.88 0 0 1 0-4.64l.8-.59a8.3 8.3 0 0 0-1.35-2.32l-.9.4a2.88 2.88 0 0 1-4.02-2.32l-.1-.98c-.45-.08-.9-.11-1.34-.12ZM12 8.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 1.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"/></svg></button>
        <button id="signin">Sign in</button>

        <div id="search">
          <svg viewBox="0 0 24 24"><path d="M15.1 16.16a8 8 0 1 1 1.06-1.06l4.62 4.62a.75.75 0 1 1-1.06 1.06l-4.62-4.62ZM16.5 10a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"/></svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search the web"
            spellCheck="false"
            autoComplete="off"
            onKeyDown={onKeyDown}
          />
        </div>

        <div id="quick">
          {QUICK.map(([id, label, url, has2x]) => (
            <button key={id} className="ql" onClick={url ? () => navigate(url) : undefined}>
              <div className="tile"><Icon name={`ql-${id}`} at={[4, 4, 28]} retina={has2x} /></div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
