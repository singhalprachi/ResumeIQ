import { useEffect, useState } from 'react'
import type { ATSScoreBreakdown } from '@/types'

const DIMS = [
  { key:'positioning_clarity', label:'Positioning & Clarity',  weight:20, color:'#4f46e5' },
  { key:'impact_depth',        label:'Impact & Achievement',   weight:25, color:'#7c3aed' },
  { key:'skill_architecture',  label:'Skill Architecture',     weight:20, color:'#0891b2' },
  { key:'experience_maturity', label:'Experience Maturity',    weight:15, color:'#16a34a' },
  { key:'human_authenticity',  label:'Human Authenticity',     weight:10, color:'#d97706' },
  { key:'ats_hygiene',         label:'ATS & Structure Hygiene',weight:10, color:'#dc2626' },
] as const

function label(s: number) {
  if (s >= 80) return { text:'Excellent', color:'#16a34a' }
  if (s >= 65) return { text:'Good',      color:'#2563eb' }
  if (s >= 50) return { text:'Average',   color:'#d97706' }
  return             { text:'Needs Work', color:'#dc2626' }
}

export default function DimensionBreakdown({ breakdown }: { breakdown: ATSScoreBreakdown }) {
  const [go, setGo] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t) }, [])

  return (
    <div className="card" style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h3 className="section-title">Score Breakdown</h3>
        <span className="badge badge-indigo">6 dimensions</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {DIMS.map((d, i) => {
          const score = (breakdown as any)[d.key] ?? 0
          const pts   = (score * d.weight / 100).toFixed(1)
          const lbl   = label(score)
          return (
            <div key={d.key} className="fade-up" style={{ opacity:0, animationDelay:`${i*60}ms`, animationFillMode:'forwards' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:d.color, display:'inline-block' }} />
                  <span style={{ fontSize:14, fontWeight:500, color:'var(--text2)' }}>{d.label}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:11, color:'var(--text4)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:6 }}>
                    {pts}/{d.weight} pts
                  </span>
                  <span style={{ fontSize:12, fontWeight:600, color:lbl.color }}>{lbl.text}</span>
                  <span style={{ fontSize:15, fontWeight:800, color:d.color, minWidth:32, textAlign:'right' }}>
                    {Math.round(score)}
                  </span>
                </div>
              </div>
              <div style={{ height:8, borderRadius:999, background:'var(--gray-100)', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:999,
                  width: go ? `${score}%` : '0%',
                  background:`linear-gradient(90deg, ${d.color}, ${d.color}cc)`,
                  transition:`width 0.9s cubic-bezier(0.34,1.1,0.64,1) ${i*60}ms`,
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
