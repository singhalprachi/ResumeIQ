import { useAppStore } from '@/store/appStore'
import ScoreRing from '@/components/analysis/ScoreRing'
import DimensionBreakdown from '@/components/analysis/DimensionBreakdown'
import KeywordsPanel from '@/components/analysis/KeywordsPanel'
import SuggestionsPanel from '@/components/analysis/SuggestionsPanel'
import StrengthsWeaknesses from '@/components/analysis/StrengthsWeaknesses'
import SectionScores from '@/components/analysis/SectionScores'
import HardCapsAlert from '@/components/analysis/HardCapsAlert'

function MetaCard({ label, value, sub, color }: { label:string; value:string; sub?:string; color?:string }) {
  return (
    <div className="card" style={{ padding:'16px 20px' }}>
      <p style={{ fontSize:11, fontWeight:600, color:'var(--text4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:16, fontWeight:700, color: color||'var(--text)', fontFamily:'var(--font-display)' }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:'var(--text4)', marginTop:2 }}>{sub}</p>}
    </div>
  )
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#16a34a' : score >= 65 ? '#4f46e5' : score >= 50 ? '#d97706' : '#dc2626'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:8, background:'var(--gray-100)', borderRadius:999, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${score}%`, background:color, borderRadius:999, transition:'width 1s ease' }} />
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, minWidth:32 }}>{score}</span>
    </div>
  )
}

export default function ResultsPage() {
  const { result, filename, reset } = useAppStore()
  if (!result) return null

  const scoreColor = result.ats_score >= 75 ? '#16a34a' : result.ats_score >= 65 ? '#4f46e5' : result.ats_score >= 50 ? '#d97706' : '#dc2626'
  const expColor = result.experience_level_match === 'Matches' ? '#16a34a' : result.experience_level_match === 'Overqualified' ? '#2563eb' : '#d97706'

  return (
    <div style={{ paddingTop:64, background:'var(--gray-50)', minHeight:'100vh' }}>

      {/* ── Top bar ── */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'20px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <span className="badge badge-green" style={{ fontSize:12 }}>✅ Analysis Complete</span>
              {result.hard_caps_applied?.length > 0 && (
                <span className="badge badge-amber" style={{ fontSize:12 }}>⚠ Score Cap Applied</span>
              )}
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--text)', letterSpacing:'-0.3px' }}>
              {result.job_title_match || 'ATS Analysis Report'}
            </h1>
            {filename && <p style={{ fontSize:13, color:'var(--text4)', marginTop:2 }}>📄 {filename}</p>}
          </div>
          <button onClick={reset} className="btn-primary" style={{ fontSize:14 }}>
            + Analyze Another Resume
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>

        {/* Hard cap warning */}
        {result.hard_caps_applied?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <HardCapsAlert caps={result.hard_caps_applied} />
          </div>
        )}

        {/* ── Score hero row ── */}
        <div className="card fade-up" style={{ padding:'28px', marginBottom:20, background:'white' }}>
          <div style={{ display:'flex', gap:32, alignItems:'center', flexWrap:'wrap' }}>

            {/* Ring */}
            <div style={{ flexShrink:0 }}>
              <ScoreRing score={result.ats_score} grade={result.score_grade} label={result.score_label} size={172} />
            </div>

            {/* Divider */}
            <div style={{ width:1, height:140, background:'var(--gray-200)', flexShrink:0 }} className="hide-sm" />

            {/* Summary + meta */}
            <div style={{ flex:1, minWidth:260 }}>
              <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.7, marginBottom:20, maxWidth:520 }}>
                {result.overall_summary}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }} className="meta-grid">
                <MetaCard label="Target Role" value={result.job_title_match || '—'} />
                <MetaCard label="Experience Fit" value={result.experience_level_match} color={expColor} />
                <MetaCard label="Candidate Level" value={result.candidate_level || '—'}
                  color={result.candidate_level==='senior'?'#2563eb':result.candidate_level==='mid-level'?'#16a34a':'var(--text3)'} />
              </div>
            </div>

            {/* Mini dimension bars */}
            <div style={{ flexShrink:0, minWidth:220 }} className="hide-sm">
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>
                Dimension Scores
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Positioning',  score:(result.breakdown as any).positioning_clarity,  color:'#4f46e5' },
                  { label:'Impact',       score:(result.breakdown as any).impact_depth,          color:'#7c3aed' },
                  { label:'Skills',       score:(result.breakdown as any).skill_architecture,    color:'#0891b2' },
                  { label:'Experience',   score:(result.breakdown as any).experience_maturity,   color:'#16a34a' },
                  { label:'Authenticity', score:(result.breakdown as any).human_authenticity,    color:'#d97706' },
                  { label:'ATS',          score:(result.breakdown as any).ats_hygiene,           color:'#dc2626' },
                ].map(d => (
                  <div key={d.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'var(--text3)', minWidth:72, fontWeight:500 }}>{d.label}</span>
                    <div style={{ flex:1, height:5, background:'var(--gray-100)', borderRadius:999, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${d.score}%`, background:d.color, borderRadius:999, transition:'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:d.color, minWidth:24 }}>{Math.round(d.score)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two column layout ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }} className="two-col">
          <div className="fade-up d1"><DimensionBreakdown breakdown={result.breakdown} /></div>
          <div className="fade-up d2"><SuggestionsPanel suggestions={result.improvement_suggestions} /></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }} className="two-col">
          <div className="fade-up d3"><KeywordsPanel matched={result.matched_keywords} missing={result.missing_critical_keywords} /></div>
          <div className="fade-up d4"><SectionScores sections={result.section_scores} /></div>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="fade-up d5" style={{ marginBottom:24 }}>
          <StrengthsWeaknesses strengths={result.top_strengths} weaknesses={result.top_weaknesses} />
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center', padding:'32px 0', borderTop:'1px solid var(--gray-200)' }}>
          <p style={{ fontSize:15, color:'var(--text3)', marginBottom:16 }}>
            Made your improvements? Test your updated resume.
          </p>
          <button onClick={reset} className="btn-primary" style={{ fontSize:16, padding:'13px 40px', borderRadius:12, fontFamily:'var(--font-display)', fontWeight:700 }}>
            Analyze Another Resume →
          </button>
          <p style={{ fontSize:12, color:'var(--text4)', marginTop:12 }}>
            Powered by GPT-4o · RAG Pipeline · SOP Scoring
          </p>
        </div>
      </div>

      <style>{`
        @media(max-width:768px) {
          .two-col { grid-template-columns: 1fr !important; }
          .meta-grid { grid-template-columns: 1fr 1fr !important; }
          .hide-sm { display: none !important; }
        }
        @media(max-width:480px) {
          .meta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
