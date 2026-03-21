import { useEffect, useState } from 'react'

interface Props { score: number; grade: string; label: string; size?: number }

function getColor(s: number) {
  if (s >= 75) return { stroke: '#16a34a', text: '#166534', bg: '#dcfce7', border:'#86efac' }
  if (s >= 65) return { stroke: '#4f46e5', text: '#3730a3', bg: '#eef2ff', border:'#c7d2fe' }
  if (s >= 50) return { stroke: '#d97706', text: '#92400e', bg: '#fef3c7', border:'#fcd34d' }
  return       { stroke: '#dc2626', text: '#991b1b', bg: '#fee2e2', border:'#fca5a5' }
}

export default function ScoreRing({ score, grade, label, size = 180 }: Props) {
  const [disp, setDisp] = useState(0)
  const [go, setGo]     = useState(false)
  const r    = size / 2 - 16
  const circ = 2 * Math.PI * r
  const off  = circ - (disp / 100) * circ
  const col  = getColor(score)

  useEffect(() => {
    const t = setTimeout(() => {
      setGo(true)
      let cur = 0
      const iv = setInterval(() => {
        cur += score / 70
        if (cur >= score) { setDisp(score); clearInterval(iv) }
        else setDisp(Math.floor(cur))
      }, 16)
      return () => clearInterval(iv)
    }, 300)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col.border} strokeWidth="12" opacity="0.4" />
          {/* Fill */}
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={col.stroke} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={go ? off : circ}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            filter="url(#glow2)"
            style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.34,1.1,0.64,1)' }}
          />
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:size*0.25, lineHeight:1, color:col.text }}>
            {disp}
          </span>
          <span style={{ fontSize:11, color:'var(--text4)', marginTop:2, fontWeight:500 }}>/100</span>
          <div style={{
            marginTop:8, padding:'3px 12px', borderRadius:999, fontSize:13, fontWeight:700,
            background:col.bg, color:col.text, border:`1.5px solid ${col.border}`,
            fontFamily:'var(--font-display)',
          }}>
            Grade {grade}
          </div>
        </div>
      </div>
      <p style={{ marginTop:10, fontWeight:700, fontSize:15, color:col.text, fontFamily:'var(--font-display)' }}>
        {label}
      </p>
    </div>
  )
}
