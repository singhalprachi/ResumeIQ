import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadResume, analyzeResume } from '@/utils/api'
import { useAppStore } from '@/store/appStore'

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Resume', desc: 'PDF or DOCX, up to 10MB. We parse every section.', icon: '📄' },
  { step: '02', title: 'Paste Job Description', desc: 'Copy the full JD — requirements, skills, responsibilities.', icon: '📋' },
  { step: '03', title: 'Get Your ATS Score', desc: 'Instant score across 6 dimensions with exact fixes.', icon: '📊' },
]

const FEATURES = [
  { icon: '🎯', title: 'SOP-Aligned Scoring', desc: '6 weighted dimensions including impact depth, skill architecture & human authenticity.' },
  { icon: '🤖', title: 'GPT-4o Analysis', desc: 'Deep semantic understanding — not just keyword matching.' },
  { icon: '🔍', title: 'RAG Pipeline', desc: 'ChromaDB vector search retrieves the most relevant resume sections for accurate scoring.' },
  { icon: '⚡', title: 'Instant Fixes', desc: 'Prioritised suggestions with before/after examples for each weakness found.' },
]

export default function UploadPage() {
  const { setSession, setJobDescription, setResult, setStep, jobDescription } = useAppStore()
  const [file, setFile] = useState<File | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [uploadDone, setUploadDone] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f); setUploadDone(false); setUploading(true)
    try {
      const res = await uploadResume(f)
      setSessionId(res.session_id)
      setSession(res.session_id, res.filename)
      setUploadDone(true)
      toast.success(`Resume uploaded — ${res.chunks_indexed} sections indexed`)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Upload failed. Please try again.')
      setFile(null)
    } finally { setUploading(false) }
  }, [setSession])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1, disabled: uploading || analyzing,
  })

  const handleAnalyze = async () => {
    if (!sessionId || jobDescription.trim().length < 50) {
      toast.error('Please upload a resume and paste a full job description')
      return
    }
    setAnalyzing(true); setStep('analyzing')
    try {
      const result = await analyzeResume(sessionId, jobDescription)
      setResult(result)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Analysis failed. Check your API key.')
      setStep('upload')
    } finally { setAnalyzing(false) }
  }

  const ready = uploadDone && jobDescription.trim().length >= 50

  return (
    <div style={{ paddingTop: 64 }}>

      {/* ── HERO ── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <span className="badge badge-indigo" style={{ fontSize: 13, padding: '5px 14px' }}>
              🚀 AI-Powered ATS Resume Scorer
            </span>
          </div>
          <h1 className="fade-up d1" style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)',
            lineHeight: 1.15, letterSpacing: '-1px', color: 'var(--text)', marginBottom: 20,
          }}>
            Match your resume to any<br />
            <span style={{ color: 'var(--primary)' }}>job description in seconds</span>
          </h1>
          <p className="fade-up d2" style={{ fontSize: 18, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            Get a precise ATS score across 6 dimensions. Know exactly what's missing and how to fix it — before you apply.
          </p>

          {/* Stats row */}
          <div className="fade-up d3" style={{ display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap' }}>
            {[
              { val: '6', label: 'Scoring Dimensions' },
              { val: 'GPT-4o', label: 'AI Engine' },
              { val: 'RAG', label: 'Pipeline' },
              { val: '~30s', label: 'Analysis Time' },
            ].map(s => (
              <div key={s.val} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--primary)' }}>{s.val}</div>
                <div style={{ fontSize:12, color:'var(--text4)', fontWeight:500, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN TOOL ── */}
      <section style={{ background: 'var(--gray-50)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }} className="tool-grid">

            {/* Resume Upload */}
            <div className="fade-up d1">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>
                  Resume <span style={{ color:'var(--red)' }}>*</span>
                </label>
                {uploadDone && <span className="badge badge-green" style={{fontSize:11}}>✓ Uploaded</span>}
              </div>
              <div
                {...getRootProps()}
                className="card"
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--primary)' : uploadDone ? 'var(--green-border)' : 'var(--gray-300)'}`,
                  background: isDragActive ? 'var(--primary-pale)' : uploadDone ? '#f0fdf4' : 'white',
                  borderRadius: 16, padding: '40px 24px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  textAlign: 'center', transition: 'all 0.2s',
                  boxShadow: isDragActive ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
                  minHeight: 220, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                }}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <>
                    <div className="spin" style={{
                      width:40, height:40, borderRadius:'50%', marginBottom:16,
                      border:'3px solid var(--primary-border)',
                      borderTopColor:'var(--primary)',
                    }} />
                    <p style={{ fontWeight:600, color:'var(--text)', fontSize:15 }}>Parsing resume...</p>
                    <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Indexing into vector store</p>
                  </>
                ) : uploadDone && file ? (
                  <>
                    <div style={{
                      width:48, height:48, borderRadius:12, background:'var(--green-bg)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:14,
                    }}>✅</div>
                    <p style={{ fontWeight:700, color:'var(--green-dark)', fontSize:15, marginBottom:4 }}>{file.name}</p>
                    <p style={{ fontSize:12, color:'var(--text4)' }}>{(file.size/1024).toFixed(0)} KB · Click to replace</p>
                  </>
                ) : (
                  <>
                    <div className="float" style={{
                      width:52, height:52, borderRadius:14,
                      background: isDragActive ? 'var(--primary)' : 'var(--primary-pale)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:16,
                    }}>
                      {isDragActive ? '📂' : '📄'}
                    </div>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize:16, marginBottom:6 }}>
                      {isDragActive ? 'Drop your resume here' : 'Drop resume here'}
                    </p>
                    <p style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>or click to browse files</p>
                    <span style={{
                      display:'inline-block', fontSize:12, fontWeight:500,
                      background:'var(--gray-100)', color:'var(--text3)',
                      padding:'4px 12px', borderRadius:6, border:'1px solid var(--gray-200)',
                    }}>
                      PDF or DOCX · Max 10MB
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* JD Input */}
            <div className="fade-up d2" style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>
                  Job Description <span style={{ color:'var(--red)' }}>*</span>
                </label>
                <span style={{ fontSize:11, color: jobDescription.length >= 50 ? 'var(--green)' : 'var(--text4)', fontWeight:500 }}>
                  {jobDescription.length} chars {jobDescription.length >= 50 ? '✓' : `(need ${50 - jobDescription.length} more)`}
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — include the role title, key requirements, tech stack, responsibilities, and qualifications for best results..."
                style={{
                  flex:1, width:'100%', minHeight:220, padding:'16px',
                  fontSize:14, lineHeight:1.6, color:'var(--text)', fontFamily:'var(--font)',
                  background:'white', borderRadius:16, resize:'none', outline:'none',
                  border:`2px solid ${jobDescription.length >= 50 ? 'var(--green-border)' : 'var(--gray-300)'}`,
                  boxShadow:'var(--shadow-sm)', transition:'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)'; }}
                onBlur={e => { e.target.style.borderColor = jobDescription.length >= 50 ? 'var(--green-border)' : 'var(--gray-300)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="fade-up d3" style={{ textAlign:'center', marginBottom:16 }}>
            <button
              onClick={handleAnalyze}
              disabled={!ready || analyzing}
              className="btn-primary"
              style={{ fontSize:16, padding:'14px 48px', borderRadius:12, fontFamily:'var(--font-display)', fontWeight:700 }}
            >
              {analyzing
                ? <><span className="spin" style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} /> Analyzing...</>
                : '🚀 Analyze My Resume'
              }
            </button>
            {!uploadDone && <p style={{ marginTop:10, fontSize:13, color:'var(--text4)' }}>Upload your resume to get started</p>}
            {uploadDone && jobDescription.length < 50 && <p style={{ marginTop:10, fontSize:13, color:'var(--text4)' }}>Paste the job description to continue</p>}
          </div>

          {/* Scoring pills */}
          <div className="fade-up d4" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8 }}>
            {[
              { label:'Positioning & Clarity', w:'20%', color:'#4f46e5' },
              { label:'Impact & Achievement', w:'25%', color:'#7c3aed' },
              { label:'Skill Architecture', w:'20%', color:'#0891b2' },
              { label:'Experience Maturity', w:'15%', color:'#16a34a' },
              { label:'Human Authenticity', w:'10%', color:'#d97706' },
              { label:'ATS Hygiene', w:'10%', color:'#dc2626' },
            ].map(d => (
              <div key={d.label} style={{
                display:'flex', alignItems:'center', gap:6,
                background:'white', border:'1px solid var(--gray-200)',
                borderRadius:999, padding:'6px 14px',
                fontSize:12, fontWeight:500, color:'var(--text2)',
                boxShadow:'var(--shadow-xs)',
              }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:d.color, display:'inline-block', flexShrink:0 }} />
                {d.label}
                <span style={{ color:d.color, fontWeight:700, fontSize:11 }}>{d.w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'64px 24px', background:'white', borderTop:'1px solid var(--gray-200)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, color:'var(--text)', marginBottom:12 }}>
              How it works
            </h2>
            <p style={{ fontSize:16, color:'var(--text3)' }}>Three steps to know exactly where your resume stands</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className={`card card-hover fade-up d${i+1}`} style={{ padding:'28px 24px', textAlign:'center' }}>
                <div style={{
                  width:52, height:52, borderRadius:14, background:'var(--primary-pale)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:26, margin:'0 auto 16px',
                }}>{item.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--primary)', letterSpacing:'0.08em', marginBottom:8, textTransform:'uppercase' }}>
                  Step {item.step}
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--text)', marginBottom:10 }}>{item.title}</h3>
                <p style={{ fontSize:14, color:'var(--text3)', lineHeight:1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding:'64px 24px', background:'var(--gray-50)', borderTop:'1px solid var(--gray-200)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28, color:'var(--text)', marginBottom:10 }}>
              More than keyword matching
            </h2>
            <p style={{ fontSize:15, color:'var(--text3)' }}>A real scoring rubric used by hiring professionals</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`card card-hover fade-up d${i+1}`} style={{ padding:'24px', display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{
                  width:44, height:44, borderRadius:12, background:'var(--primary-pale)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0,
                }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:6 }}>{f.title}</h3>
                  <p style={{ fontSize:14, color:'var(--text3)', lineHeight:1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .tool-grid { grid-template-columns: 1fr !important; }
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
