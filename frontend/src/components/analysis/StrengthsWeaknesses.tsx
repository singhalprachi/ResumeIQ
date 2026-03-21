export default function StrengthsWeaknesses({ strengths, weaknesses }: { strengths: string[], weaknesses: string[] }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="sw-grid">
      <div className="card" style={{ padding:24, border:'1px solid var(--green-border)', background:'#f0fdf4' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'var(--green-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💪</div>
          <h3 className="section-title" style={{ color:'var(--green-dark)' }}>Top Strengths</h3>
        </div>
        <ul style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {strengths.map((s, i) => (
            <li key={i} className="fade-up" style={{ display:'flex', alignItems:'flex-start', gap:8, opacity:0, animationDelay:`${i*50}ms`, animationFillMode:'forwards' }}>
              <span style={{ color:'var(--green)', fontWeight:700, marginTop:1, flexShrink:0 }}>✓</span>
              <span style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ padding:24, border:'1px solid var(--red-border)', background:'#fff5f5' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'var(--red-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚠️</div>
          <h3 className="section-title" style={{ color:'var(--red)' }}>Key Weaknesses</h3>
        </div>
        <ul style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {weaknesses.map((w, i) => (
            <li key={i} className="fade-up" style={{ display:'flex', alignItems:'flex-start', gap:8, opacity:0, animationDelay:`${i*50}ms`, animationFillMode:'forwards' }}>
              <span style={{ color:'var(--red)', fontWeight:700, marginTop:1, flexShrink:0 }}>✗</span>
              <span style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>{w}</span>
            </li>
          ))}
        </ul>
      </div>
      <style>{`@media(max-width:640px){.sw-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
