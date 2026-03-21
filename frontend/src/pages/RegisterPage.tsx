import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { registerUser } from '@/utils/authApi'
import toast from 'react-hot-toast'

interface Props {
  onSwitch: () => void
  onSuccess: () => void
}

export default function RegisterPage({ onSwitch, onSuccess }: Props) {
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const strength = (() => {
    const p = form.password
    if (!p) return { score: 0, label: '', color: '' }
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    if (s <= 1) return { score: s, label: 'Weak', color: '#dc2626' }
    if (s <= 3) return { score: s, label: 'Fair', color: '#d97706' }
    return { score: s, label: 'Strong', color: '#16a34a' }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await registerUser({ name: form.name, email: form.email, password: form.password })
      setAuth(res.user, res.access_token)
      toast.success(`Account created! Welcome, ${res.user.name} 🎉`)
      onSuccess()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed.'
      toast.error(msg)
      if (msg.toLowerCase().includes('email')) setErrors({ email: 'This email is already registered' })
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors(er => ({ ...er, [key]: '' }))
    },
  })

  return (
    <div style={pageStyle}>
      <div style={cardStyle} className="fade-up">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={logoStyle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>
            Free forever · No credit card needed
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              type="text" placeholder="Arjun Singh" autoComplete="name"
              style={{ ...inputStyle, borderColor: errors.name ? 'var(--red)' : undefined }}
              {...field('name')}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)' }}
              onBlur={e => { e.target.style.borderColor = errors.name ? 'var(--red)' : 'var(--gray-300)'; e.target.style.boxShadow = 'none' }}
            />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email" placeholder="you@example.com" autoComplete="email"
              style={{ ...inputStyle, borderColor: errors.email ? 'var(--red)' : undefined }}
              {...field('email')}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)' }}
              onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--red)' : 'var(--gray-300)'; e.target.style.boxShadow = 'none' }}
            />
            {errors.email && <p style={errStyle}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 44, borderColor: errors.password ? 'var(--red)' : undefined }}
                {...field('password')}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)' }}
                onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--red)' : 'var(--gray-300)'; e.target.style.boxShadow = 'none' }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={eyeBtn}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 999, transition: 'background 0.3s',
                      background: i <= strength.score ? strength.color : 'var(--gray-200)',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                  {strength.label} password
                </p>
              </div>
            )}
            {errors.password && <p style={errStyle}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input
              type={showPass ? 'text' : 'password'} placeholder="Repeat password"
              autoComplete="new-password"
              style={{
                ...inputStyle,
                borderColor: errors.confirm ? 'var(--red)' : form.confirm && form.confirm === form.password ? 'var(--green)' : undefined,
              }}
              {...field('confirm')}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)' }}
              onBlur={e => {
                e.target.style.borderColor = errors.confirm ? 'var(--red)' : form.confirm === form.password && form.confirm ? 'var(--green)' : 'var(--gray-300)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {form.confirm && form.confirm === form.password && (
              <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 5, fontWeight: 600 }}>✓ Passwords match</p>
            )}
            {errors.confirm && <p style={errStyle}>{errors.confirm}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: 15, borderRadius: 10, marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 700 }}
          >
            {loading
              ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> Creating account...</>
              : 'Create Free Account →'
            }
          </button>
        </form>

        {/* Switch to login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          <span style={{ fontSize: 12, color: 'var(--text4)' }}>Already have an account?</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
        </div>
        <button onClick={onSwitch} className="btn-outline" style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 10 }}>
          Log in instead
        </button>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--gray-50)', padding: '24px',
}
const cardStyle: React.CSSProperties = {
  width: '100%', maxWidth: 420,
  background: 'white', borderRadius: 20,
  border: '1px solid var(--gray-200)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  padding: '40px 36px',
}
const logoStyle: React.CSSProperties = {
  width: 52, height: 52, borderRadius: 14,
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 16px',
  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text2)', marginBottom: 7,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  border: '1.5px solid var(--gray-300)', borderRadius: 10,
  outline: 'none', fontFamily: 'var(--font)', color: 'var(--text)',
  background: 'white', transition: 'all 0.15s', boxSizing: 'border-box',
}
const errStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--red)', marginTop: 5, fontWeight: 500,
}
const eyeBtn: React.CSSProperties = {
  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1,
}
