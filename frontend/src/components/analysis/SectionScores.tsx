import { useState } from 'react'
import type { SectionScore } from '@/types'

function pct(s: SectionScore) { return s.max_score > 0 ? (s.score / s.max_score) * 100 : 0 }
function col(p: number) {
  if (p >= 75) return '#16a34a'
  if (p >= 55) return '#2563eb'
  if (p >= 40) return '#d97706'
  return '#dc2626'
}

export default function SectionScores({ sections }: { sections: SectionScore[] }) {
  const [open, setOpen] = useState<number|null>(null)
  if (!sections.length) return null

  return (
    <div className="card" style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h3 className="section-title">Dimension Details</h3>
        <span className="badge badge-indigo">{sections.length} sections</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {sections.map((sec, i) => {
          const p = pct(sec); const c = col(p); const isOpen = open === i
          return (
            <div key={i}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                borderRadius:12, border:`1px solid ${isOpen ? c+'40' : 'var(--gray-200)'}`,
                background: isOpen ? `${c}08` : 'white',
                overflow:'hidden', cursor:'pointer', transition:'all 0.2s',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px' }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:`${c}12`, border:`1.5px solid ${c}30`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:800, color:c,
                }}>
                  {sec.score.toFixed(0)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{sec.section}</span>
                    <span style={{ fontSize:12, color:'var(--text4)' }}>{sec.score.toFixed(1)}/{sec.max_score}</span>
                  </div>
                  <div style={{ height:5, borderRadius:999, background:'var(--gray-100)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:999, width:`${p}%`, background:c, transition:'width 0.8s ease' }} />
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ flexShrink:0, transform:isOpen?'rotate(180deg)':'none', transition:'0.2s', color:'var(--text4)' }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {isOpen && (
                <div className="fade-in" style={{ padding:'0 16px 14px', borderTop:`1px solid ${c}20` }}>
                  <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6, margin:'10px 0 8px' }}>{sec.feedback}</p>
                  {sec.suggestions.length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {sec.suggestions.map((sg, j) => (
                        <div key={j} style={{ display:'flex', gap:6, fontSize:13, color:'var(--text3)' }}>
                          <span style={{ color:c, flexShrink:0 }}>→</span>{sg}
                        </div>
                      ))}
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
