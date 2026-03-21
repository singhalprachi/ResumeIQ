import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import UploadPage from '@/pages/UploadPage'
import AnalyzingPage from '@/pages/AnalyzingPage'
import ResultsPage from '@/pages/ResultsPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

type AuthView = 'login' | 'register' | null

export default function App() {
  const step = useAppStore((s) => s.step)
  const { isAuthenticated, initFromStorage } = useAuthStore()
  const [authView, setAuthView] = useState<AuthView>(null)

  // Restore auth from localStorage on first load
  useEffect(() => {
    initFromStorage()
  }, [])

  // If user clicks "Log In" or "Sign Up" on Navbar
  const openAuth = (view: AuthView = 'login') => setAuthView(view)
  const closeAuth = () => setAuthView(null)

  // After successful auth → close modal, stay on current page
  const onAuthSuccess = () => setAuthView(null)

  // Show auth pages (full screen, no navbar)
  if (authView === 'login') {
    return (
      <>
        <Navbar onLoginClick={() => setAuthView('register')} />
        <LoginPage
          onSwitch={() => setAuthView('register')}
          onSuccess={onAuthSuccess}
        />
      </>
    )
  }

  if (authView === 'register') {
    return (
      <>
        <Navbar onLoginClick={() => setAuthView('login')} />
        <RegisterPage
          onSwitch={() => setAuthView('login')}
          onSuccess={onAuthSuccess}
        />
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onLoginClick={() => openAuth('login')} />
      <main style={{ flex: 1 }}>
        {step === 'upload'    && <UploadPage />}
        {step === 'analyzing' && <AnalyzingPage />}
        {step === 'results'   && <ResultsPage />}
      </main>
      {step === 'upload' && <Footer />}
    </div>
  )
}
