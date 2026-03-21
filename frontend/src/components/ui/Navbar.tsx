import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { logoutUser } from '@/utils/authApi'
import toast from 'react-hot-toast'

interface Props {
  onLoginClick: () => void
}

export default function Navbar({ onLoginClick }: Props) {
  const { reset, step } = useAppStore()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try { await logoutUser() } catch {}
    clearAuth()
    reset()
    setMenuOpen(false)
    toast.success('Logged out successfully')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--gray-200)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <button onClick={() => { reset() }} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--text)', letterSpacing:'-0.3px' }}>
            Resume<span style={{ color:'var(--primary)' }}>IQ</span>
          </span>
        </button>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>

          {/* Status badge */}
          <div className="badge badge-green" style={{ fontSize:12 }}>
            <span className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
            GPT-4o Live
          </div>

          {/* Back button on results */}
          {step !== 'upload' && (
            <button onClick={reset} className="btn-outline" style={{ fontSize:13, padding:'7px 14px' }}>
              ← New Analysis
            </button>
          )}

          {/* Auth section */}
          {isAuthenticated && user ? (
            <div style={{ position:'relative' }} ref={menuRef}>
              <button
                onClick={() => setMenuOpen(s => !s)}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  background:'none', border:'1px solid var(--gray-200)',
                  borderRadius:10, padding:'6px 12px 6px 6px',
                  cursor:'pointer', transition:'all 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gray-300)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--gray-200)')}
              >
                {/* Avatar */}
                <div style={{
                  width:30, height:30, borderRadius:8,
                  background:'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700, color:'white',
                  fontFamily:'var(--font-display)',
                }}>
                  {initials}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>
                  {user.name.split(' ')[0]}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ color:'var(--text4)', transform: menuOpen ? 'rotate(180deg)' : 'none', transition:'0.2s' }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="fade-in" style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0,
                  background:'white', border:'1px solid var(--gray-200)',
                  borderRadius:12, boxShadow:'var(--shadow-md)',
                  width:220, zIndex:200, overflow:'hidden',
                }}>
                  {/* User info */}
                  <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--gray-100)' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{user.name}</p>
                    <p style={{ fontSize:12, color:'var(--text4)' }}>{user.email}</p>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon:'📊', label:'My Analyses', action:() => { setMenuOpen(false) } },
                    { icon:'⚙️', label:'Account Settings', action:() => { setMenuOpen(false) } },
                  ].map(item => (
                    <button key={item.label} onClick={item.action} style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'11px 16px', background:'none', border:'none',
                      cursor:'pointer', fontSize:13, color:'var(--text2)', textAlign:'left',
                      transition:'background 0.1s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}

                  <div style={{ borderTop:'1px solid var(--gray-100)' }}>
                    <button onClick={handleLogout} style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'11px 16px', background:'none', border:'none',
                      cursor:'pointer', fontSize:13, color:'var(--red)', textAlign:'left',
                      transition:'background 0.1s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--red-bg)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span>🚪</span> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={onLoginClick} className="btn-outline" style={{ fontSize:13, padding:'8px 16px' }}>
                Log In
              </button>
              <button onClick={onLoginClick} className="btn-primary" style={{ fontSize:13, padding:'8px 16px' }}>
                Sign Up Free
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
