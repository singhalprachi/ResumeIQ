export default function HardCapsAlert({ caps }: { caps: string[] }) {
  if (!caps?.length) return null
  return (
    <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
      <div style={{ width:32, height:32, borderRadius:8, background:'#ffedd5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>⚠️</div>
      <div>
        <p style={{ fontSize:14, fontWeight:700, color:'#c2410c', marginBottom:4 }}>Hard Cap Applied — Score Limited</p>
        {caps.map((c, i) => <p key={i} style={{ fontSize:13, color:'#ea580c' }}>{c}</p>)}
      </div>
    </div>
  )
}
