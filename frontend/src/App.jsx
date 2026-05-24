import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import MBTITest from './pages/MBTITest.jsx'
import Big5Test from './pages/Big5Test.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

function loadState(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null }
}
function saveState(key, val) {
  try { sessionStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export default function App() {
  const [user, setUser] = useState(() => loadState('pm_user'))
  const [mbtiResult, setMbtiResult] = useState(() => loadState('pm_mbti'))
  const [big5Result, setBig5Result] = useState(() => loadState('pm_big5'))

  const handleUser = (u) => { setUser(u); saveState('pm_user', u) }
  const handleMbti = (r) => { setMbtiResult(r); saveState('pm_mbti', r) }
  const handleBig5 = (r) => { setBig5Result(r); saveState('pm_big5', r) }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage onComplete={handleUser} />} />
      <Route path="/test/mbti" element={
        user ? <MBTITest user={user} onComplete={handleMbti} /> : <Navigate to="/onboarding" replace />
      } />
      <Route path="/test/big5" element={
        user && mbtiResult
          ? <Big5Test user={user} mbtiResult={mbtiResult} onComplete={handleBig5} />
          : <Navigate to="/onboarding" replace />
      } />
      <Route path="/results" element={
        user && mbtiResult && big5Result
          ? <ResultsPage user={user} mbti={mbtiResult} big5={big5Result} />
          : <Navigate to="/onboarding" replace />
      } />
    </Routes>
  )
}
