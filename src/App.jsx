import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import JuzListPage from './pages/JuzListPage.jsx'
import JuzReadPage from './pages/JuzReadPage.jsx'
import PageListPage from './pages/PageListPage.jsx'
import PageReadPage from './pages/PageReadPage.jsx'
import SurahListPage from './pages/SurahListPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import SurahReadPage from './pages/SurahReadPage.jsx'
import WordsPage from './pages/WordsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SurahListPage />} />
        <Route path="/surah/:number" element={<SurahReadPage />} />
        <Route path="/pages" element={<PageListPage />} />
        <Route path="/page/:number" element={<PageReadPage />} />
        <Route path="/juz" element={<JuzListPage />} />
        <Route path="/juz/:number" element={<JuzReadPage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
