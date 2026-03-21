export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--gray-200)',
      background: 'var(--gray-50)',
      padding: '32px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
            ResumeIQ
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text4)' }}>
          Powered by GPT-4o · RAG Pipeline · SOP-Aligned Scoring
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Privacy', 'Terms', 'Contact'].map(item => (
            <span key={item} style={{ fontSize: 13, color: 'var(--text3)', cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
