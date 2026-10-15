import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HadithBookPage from './pages/HadithBookPage.jsx'
import HadithBooksPage from './pages/HadithBooksPage.jsx'
import HadithReadPage from './pages/HadithReadPage.jsx'
import JuzListPage from './pages/JuzListPage.jsx'
import JuzReadPage from './pages/JuzReadPage.jsx'
import PageListPage from './pages/PageListPage.jsx'
import PageReadPage from './pages/PageReadPage.jsx'
import SurahListPage from './pages/SurahListPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import SurahPagesPage from './pages/SurahPagesPage.jsx'
import SurahReadPage from './pages/SurahReadPage.jsx'
import WordsPage from './pages/WordsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SurahListPage />} />
        <Route path="/surah/:number" element={<SurahReadPage />} />
        <Route path="/surah/:number/pages" element={<SurahPagesPage />} />
        <Route path="/surah/:surah/page/:number" element={<PageReadPage />} />
        <Route path="/pages" element={<PageListPage />} />
        <Route path="/page/:number" element={<PageReadPage />} />
        <Route path="/juz" element={<JuzListPage />} />
        <Route path="/juz/:number" element={<JuzReadPage />} />
        <Route path="/books" element={<HadithBooksPage />} />
        <Route path="/book/:id" element={<HadithBookPage />} />
        <Route path="/book/:id/s/:section" element={<HadithBookPage />} />
        <Route path="/book/:id/s/:section/:number" element={<HadithReadPage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
