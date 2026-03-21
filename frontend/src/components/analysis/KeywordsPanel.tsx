import { useState } from 'react'
import type { KeywordMatch } from '@/types'

interface Props { matched: KeywordMatch[]; missing: string[] }

export default function KeywordsPanel({ matched, missing }: Props) {
  const [tab, setTab] = useState<'all'|'found'|'missing'>('all')
  const found   = matched.filter(k => k.found_in_resume)
  const notFound= matched.filter(k => !k.found_in_resume)
  const allMiss = [...notFound.map(k=>k.keyword), ...missing.filter(m=>!notFound.find(k=>k.keyword===m))]
  const shown   = tab==='found' ? found : tab==='missing' ? notFound : matched

  const impDot: Record<string, string> = { high:'#dc2626', medium:'#d97706', low:'#9ca3af' }

  return (
    <div className="card" style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h3 className="section-title">Keyword Match</h3>
        <div style={{ display:'flex', gap:12, fontSize:13, fontWeight:600 }}>
          <span style={{ color:'var(--green)' }}>✓ {found.length} matched</span>
          <span style={{ color:'var(--red)' }}>✗ {allMiss.length} missing</span>
        </div>
      </div>

      {/* Match meter */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text4)', marginBottom:6 }}>
          <span>Match rate</span>
          <span style={{ fontWeight:700, color:'var(--text)' }}>
            {matched.length > 0 ? Math.round((found.length/matched.length)*100) : 0}%
          </span>
        </div>
        <div style={{ height:6, borderRadius:999, background:'var(--gray-100)', overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:999,
            width: matched.length > 0 ? `${(found.length/matched.length)*100}%` : '0%',
            background:'linear-gradient(90deg, #16a34a, #4ade80)',
            transition:'width 1s ease',
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--gray-100)', borderRadius:10, padding:4 }}>
        {([['all',`All (${matched.length})`],['found',`✓ Found (${found.length})`],['missing',`✗ Missing (${notFound.length})`]] as const).map(([val, lbl]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            flex:1, padding:'7px 8px', borderRadius:8, fontSize:12, fontWeight:600,
            border:'none', cursor:'pointer', transition:'all 0.15s',
            background: tab===val ? 'white' : 'transparent',
            color: tab===val ? 'var(--primary)' : 'var(--text3)',
            boxShadow: tab===val ? 'var(--shadow-sm)' : 'none',
          }}>{lbl}</button>
        ))}
      </div>

      {/* Keyword pills */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        {shown.map(kw => (
          <div key={kw.keyword} title={kw.context || ''} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:500,
            background: kw.found_in_resume ? 'var(--green-bg)' : 'var(--red-bg)',
            border:`1px solid ${kw.found_in_resume ? 'var(--green-border)' : 'var(--red-border)'}`,
            color: kw.found_in_resume ? 'var(--green-dark)' : 'var(--red)',
            cursor:'default', transition:'transform 0.15s',
          }}
          onMouseOver={e=>(e.currentTarget.style.transform='scale(1.04)')}
          onMouseOut={e=>(e.currentTarget.style.transform='scale(1)')}
          >
            <span style={{ fontSize:10 }}>{kw.found_in_resume ? '✓' : '✗'}</span>
            {kw.keyword}
            {kw.frequency > 1 && <span style={{ opacity:0.6, fontSize:10 }}>×{kw.frequency}</span>}
            <span style={{ width:5, height:5, borderRadius:'50%', background:impDot[kw.importance]||'#ccc', display:'inline-block' }} />
          </div>
        ))}
        {shown.length === 0 && <p style={{ fontSize:13, color:'var(--text4)' }}>No keywords to show</p>}
      </div>

      {/* Missing callout */}
      {allMiss.length > 0 && tab !== 'found' && (
        <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'#c2410c', marginBottom:10 }}>
            💡 Add these to your resume where genuinely applicable:
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {allMiss.slice(0,14).map(k => (
              <span key={k} style={{
                padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:500,
                background:'#ffedd5', color:'#c2410c', border:'1px solid #fed7aa',
              }}>{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
