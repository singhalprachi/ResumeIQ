import { useState } from 'react'
import type { ImprovementSuggestion } from '@/types'

const CFG = {
  high:   { bg:'#fee2e2', border:'#fca5a5', color:'#dc2626', label:'High Priority',  dot:'#ef4444' },
  medium: { bg:'#fef3c7', border:'#fcd34d', color:'#d97706', label:'Medium',         dot:'#f59e0b' },
  low:    { bg:'#eff6ff', border:'#bfdbfe', color:'#2563eb', label:'Low Priority',   dot:'#60a5fa' },
}

export default function SuggestionsPanel({ suggestions }: { suggestions: ImprovementSuggestion[] }) {
  const [open, setOpen] = useState<number|null>(0)
  if (!suggestions.length) return null

  return (
    <div className="card" style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h3 className="section-title">Improvement Plan</h3>
        <span className="badge badge-indigo">{suggestions.length} fixes</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {suggestions.map((s, i) => {
          const c  = CFG[s.priority]
          const isOpen = open === i
          return (
            <div key={i} style={{
              borderRadius:12, overflow:'hidden', border:`1px solid ${isOpen ? c.border : 'var(--gray-200)'}`,
              background: isOpen ? c.bg : 'white',
              transition:'all 0.2s',
              boxShadow: isOpen ? `0 2px 8px ${c.dot}18` : 'none',
            }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'13px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left',
                }}
              >
                <span style={{
                  fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                  background: isOpen ? 'white' : `${c.dot}15`,
                  color:c.color, border:`1px solid ${c.border}`, flexShrink:0, whiteSpace:'nowrap',
                }}>{c.label}</span>
                <span style={{
                  fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6,
                  background:'var(--gray-100)', color:'var(--text3)', flexShrink:0,
                }}>{s.category}</span>
                <span style={{ flex:1, fontSize:14, fontWeight:500, color:'var(--text)', lineHeight:1.4 }}>{s.issue}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ flexShrink:0, transform: isOpen?'rotate(180deg)':'none', transition:'transform 0.2s', color:'var(--text4)' }}>
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {isOpen && (
                <div className="fade-up" style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ background:'white', borderRadius:10, padding:'12px 14px', border:'1px solid var(--gray-200)' }}>
                    <p style={{ fontSize:11, fontWeight:700, color:c.color, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      ✏️ How to fix
                    </p>
                    <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.6 }}>{s.fix}</p>
                  </div>
                  {s.example && (
                    <div style={{ background:'var(--primary-pale)', borderRadius:10, padding:'12px 14px', border:'1px solid var(--primary-border)' }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'var(--primary)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        💡 Example
                      </p>
                      <p style={{ fontSize:13, color:'var(--primary-dark)', fontStyle:'italic', lineHeight:1.6 }}>"{s.example}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
