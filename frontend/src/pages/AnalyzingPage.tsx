import { useEffect, useState } from 'react'

const STEPS = [
  { icon: '📄', label: 'Parsing resume structure',    detail: 'Detecting sections, bullets & formatting',  color: '#4f46e5', dur: 2000 },
  { icon: '🔍', label: 'Running RAG retrieval',       detail: 'Embedding & querying ChromaDB vectors',     color: '#7c3aed', dur: 3000 },
  { icon: '📋', label: 'Extracting JD signals',       detail: 'Keywords, requirements & tech stack',        color: '#0891b2', dur: 2500 },
  { icon: '⚖️', label: 'Scoring 6 SOP dimensions',   detail: 'Applying rubric, hard caps & calibration',  color: '#16a34a', dur: 5000 },
  { icon: '🤖', label: 'GPT-4o deep analysis',        detail: 'Impact depth, authenticity & suggestions',  color: '#d97706', dur: 4000 },
  { icon: '📊', label: 'Generating final report',     detail: 'Weighted score, grade & improvement plan',  color: '#dc2626', dur: 1500 },
]

export default function AnalyzingPage() {
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState<number[]>([])
  const [dots, setDots] = useState('')

  useEffect(() => {
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setCurrent(i), elapsed))
      timers.push(setTimeout(() => setDone(p => [...p, i]), elapsed + s.dur - 300))
      elapsed += s.dur
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])

  const progress = Math.round((done.length / STEPS.length) * 100)

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--gray-50)', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 24px' }}>
      <div style={{ width:'100%', maxWidth:560 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, margin:'0 auto 20px',
            boxShadow:'0 8px 24px rgba(79,70,229,0.3)',
          }}>
            🤖
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, color:'var(--text)', marginBottom:8 }}>
            Analyzing your resume{dots}
          </h2>
          <p style={{ fontSize:14, color:'var(--text3)' }}>
            GPT-4o is scoring across 6 SOP dimensions — this takes about 30 seconds
          </p>
        </div>

        {/* Progress */}
        <div className="card" style={{ padding:'4px', marginBottom:24, borderRadius:999 }}>
          <div style={{
            height:8, borderRadius:999, background:'var(--gray-100)', overflow:'hidden',
          }}>
            <div style={{
              height:'100%', borderRadius:999, transition:'width 0.6s ease',
              width:`${progress}%`,
              background:'linear-gradient(90deg, #4f46e5, #7c3aed)',
              boxShadow:'0 0 10px rgba(79,70,229,0.4)',
            }} />
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24, fontSize:12, color:'var(--text4)', fontWeight:500 }}>
          <span>Progress</span>
          <span style={{ color:'var(--primary)', fontWeight:700 }}>{progress}%</span>
        </div>

        {/* Steps */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {STEPS.map((step, i) => {
            const isDone = done.includes(i)
            const isCur = current === i && !isDone
            const isPend = !isDone && !isCur

            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 18px', borderRadius:14, transition:'all 0.3s',
                background: isCur ? 'white' : isDone ? 'white' : 'transparent',
                border:`1px solid ${isCur ? step.color+'40' : isDone ? 'var(--gray-200)' : 'transparent'}`,
                boxShadow: isCur ? `0 2px 12px ${step.color}18` : 'none',
                opacity: isPend ? 0.35 : 1,
                transform: isCur ? 'scale(1.01)' : 'scale(1)',
              }}>
                {/* Status */}
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background: isDone ? '#f0fdf4' : isCur ? `${step.color}15` : 'var(--gray-100)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18,
                }}>
                  {isDone ? '✅' : isCur ? <span className="pulse-dot" style={{ fontSize:18 }}>{step.icon}</span> : <span style={{ filter:'grayscale(1)', opacity:0.5 }}>{step.icon}</span>}
                </div>

                <div style={{ flex:1 }}>
                  <p style={{
                    fontSize:14, fontWeight:600,
                    color: isDone ? 'var(--green-dark)' : isCur ? 'var(--text)' : 'var(--text3)',
                    marginBottom: isCur ? 2 : 0,
                  }}>
                    {step.label}
                  </p>
                  {isCur && <p style={{ fontSize:12, color:'var(--text4)' }}>{step.detail}</p>}
                </div>

                {isCur && (
                  <div className="spin" style={{
                    width:18, height:18, borderRadius:'50%', flexShrink:0,
                    border:`2px solid ${step.color}30`, borderTopColor:step.color,
                  }} />
                )}
                {isDone && <span style={{ fontSize:11, fontWeight:600, color:'var(--green)', flexShrink:0 }}>Done</span>}
              </div>
            )
          })}
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text4)', marginTop:24 }}>
          Powered by GPT-4o · ChromaDB RAG · SOP Scoring Rubric
        </p>
      </div>
    </div>
  )
}
