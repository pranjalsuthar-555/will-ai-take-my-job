import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import WinWindow from './WinWindow'

// ── CSS-drawn Win98 folder icon ──────────────────────────────────────────────
function FolderIcon({ hasRisk }) {
  return (
    <div style={{ position: 'relative', width: 44, height: 38, margin: '0 auto' }}>
      {/* folder tab */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 18, height: 7,
        background: '#ECA500',
        borderTop: '2px solid #F8D868',
        borderLeft: '2px solid #F8D868',
        borderRight: '2px solid #C08018',
      }} />
      {/* folder body */}
      <div style={{
        position: 'absolute', top: 5, left: 0,
        width: 44, height: 33,
        background: '#FFCB00',
        borderTop: '2px solid #F8D868',
        borderLeft: '2px solid #F8D868',
        borderRight: '2px solid #A07818',
        borderBottom: '2px solid #A07818',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {hasRisk && (
          <span style={{ fontSize: 13, color: '#CC0000', fontWeight: 'bold', lineHeight: 1 }}>⚠</span>
        )}
      </div>
    </div>
  )
}

// ── Expandable job file row ──────────────────────────────────────────────────
function JobFile({ job }) {
  const [open, setOpen] = useState(false)
  const mono = { fontFamily: "'Courier New', Courier, monospace" }
  return (
    <div className="job-file-item" onClick={() => setOpen(o => !o)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1 }}>
          {job.at_risk ? '⚠' : '📄'}
        </span>
        <span className="job-file-name" style={{ ...mono, flex: 1, fontSize: 12, fontWeight: open ? 'bold' : 'normal' }}>
          {job.occupation}
        </span>
        <span className={job.at_risk ? 'badge-risk' : 'badge-safe'} style={{ flexShrink: 0 }}>
          {job.at_risk ? '⚠ AT RISK' : '✓ SAFE'}
        </span>
      </div>
      {open && (
        <div className="job-file-desc" style={{ ...mono, marginTop: 4, paddingLeft: 22, fontSize: 11, color: '#333', lineHeight: 1.6 }}>
          {job.description}
        </div>
      )}
    </div>
  )
}

const normalizeCluster = name => name.split(/[;,]/)[0].trim()

const SYNONYMS = {
  'doctor':          ['physician', 'surgeon', 'medical', 'psychiatrist', 'dentist'],
  'lawyer':          ['attorney', 'legal', 'paralegal', 'judge'],
  'teacher':         ['instructor', 'educator', 'professor', 'tutor'],
  'content creator': ['writer', 'editor', 'producer', 'media', 'communications', 'broadcast'],
  'influencer':      ['marketing', 'social media', 'public relations', 'communications'],
  'programmer':      ['software', 'developer', 'engineer', 'coder'],
  'accountant':      ['bookkeeping', 'auditing', 'financial', 'tax'],
  'nurse':           ['nursing', 'clinical', 'care', 'health'],
  'designer':        ['graphic', 'visual', 'art director', 'creative'],
  'chef':            ['cook', 'culinary', 'food preparation'],
  'driver':          ['transport', 'logistics', 'delivery', 'operator'],
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [jobs, setJobs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [checkQuery, setCheckQuery]     = useState('')
  const [filter, setFilter]             = useState('all')
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [checkResults, setCheckResults] = useState(null)

  useEffect(() => {
    fetch('/jobs.json')
      .then(r => r.json())
      .then(data => { setJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fuse = useMemo(() => new Fuse(jobs, {
    keys: [
      { name: 'occupation',     weight: 3 },
      { name: 'career_cluster', weight: 1 },
    ],
    threshold: 0.3,
    includeScore: true,
  }), [jobs])

  const stats = useMemo(() => ({
    total:    jobs.length,
    atRisk:   jobs.filter(j => j.at_risk).length,
    clusters: new Set(jobs.map(j => j.career_cluster)).size,
  }), [jobs])

  // One entry per career cluster with counts
  const clusters = useMemo(() => {
    const map = {}
    jobs.forEach(job => {
      const key = normalizeCluster(job.career_cluster)
      if (!map[key]) map[key] = { name: key, total: 0, atRisk: 0 }
      map[key].total++
      if (job.at_risk) map[key].atRisk++
    })
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
  }, [jobs])

  // Folders visible in MY_COMPUTER — filtered by checkQuery (cluster name) + filter pill
  const visibleClusters = useMemo(() => {
    const q = checkQuery.trim().toLowerCase()
    return clusters.filter(c => {
      if (filter === 'at-risk' && c.atRisk === 0) return false
      if (filter === 'safe'    && c.atRisk === c.total) return false
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [clusters, checkQuery, filter])

  // Jobs shown inside an open cluster — filtered by checkQuery (occupation) + filter pill
  const clusterJobs = useMemo(() => {
    if (!selectedCluster) return []
    const q = checkQuery.trim().toLowerCase()
    return jobs.filter(job => {
      if (normalizeCluster(job.career_cluster) !== selectedCluster) return false
      if (filter === 'at-risk' && !job.at_risk) return false
      if (filter === 'safe'    &&  job.at_risk) return false
      if (q && !job.occupation.toLowerCase().includes(q)) return false
      return true
    })
  }, [jobs, selectedCluster, checkQuery, filter])

  function handleCheck(e) {
    e.preventDefault()
    const q = checkQuery.trim()
    if (!q) return

    // Expand query with synonyms if the term is in the map
    const extraTerms = SYNONYMS[q.toLowerCase()] ?? []
    const searchTerms = [q, ...extraTerms]

    // Run Fuse for each term, collect items with their best score
    const seen = new Map() // code → { item, score }
    searchTerms.forEach(term => {
      fuse.search(term, { limit: 10 }).forEach(({ item, score }) => {
        const existing = seen.get(item.code)
        if (!existing || score < existing.score) seen.set(item.code, { item, score })
      })
    })

    // Sort by score (lower = better), keep top 3 that share a word with any search term
    const allWords = searchTerms.flatMap(t => t.toLowerCase().split(/\s+/).filter(w => w.length > 1))
    const results = [...seen.values()]
      .sort((a, b) => a.score - b.score)
      .map(r => r.item)
      .filter(job => allWords.some(w => job.occupation.toLowerCase().includes(w)))
      .slice(0, 3)

    setCheckResults(results)
  }

  function openCluster(name) {
    setSelectedCluster(name)
    setCheckQuery('')
    setCheckResults(null)
  }

  function closeCluster() {
    setSelectedCluster(null)
    setCheckQuery('')
    setCheckResults(null)
  }

  // Helpers
  const mono         = { fontFamily: "'Courier New', Courier, monospace" }
  const clusterShort = name => name.split(/[,&]/)[0].trim()
  const clusterPath  = name => 'C:\\' + name.split(/[\s,&\/]/)[0].toUpperCase() + '\\'

  const totalAtRiskInCluster = selectedCluster
    ? jobs.filter(j => normalizeCluster(j.career_cluster) === selectedCluster && j.at_risk).length
    : 0

  const filters = [
    { key: 'all',     label: 'All Jobs'  },
    { key: 'at-risk', label: '⚠ At Risk' },
    { key: 'safe',    label: '✓ Safe'    },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 12px 60px' }}>

        {/* ── Hero ── */}
        <WinWindow title="WILL_AI_TAKE_MY_JOB.EXE" icon="💾" style={{ marginBottom: 10 }}>
          <div style={{ padding: '24px 20px 20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(13px, 2.5vw, 20px)', color: '#000080', margin: '0 0 20px', letterSpacing: 1 }}>
              Will AI take<br />my job?
            </h1>
            <p style={{ ...mono, fontSize: 13, margin: 0, lineHeight: 1.8 }}>
              {loading
                ? <>C:\careers\future&gt; loading...<span className="cursor" /></>
                : <>C:\careers\future&gt; scanning {stats.total.toLocaleString()} occupations...<span className="cursor" /></>
              }
            </p>
          </div>
        </WinWindow>

        {/* ── Stats ── */}
        {!loading && (
          <WinWindow title="SYSTEM_PROPERTIES.EXE" icon="💻" style={{ marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { value: stats.total,    label: 'TOTAL JOBS'            },
                { value: stats.atRisk,   label: 'AT-RISK JOBS', accent: true },
                { value: stats.clusters, label: 'CLUSTERS'              },
              ].map(({ value, label, accent }) => (
                <div key={label} className="win-inset" style={{ textAlign: 'center' }}>
                  <div style={{ ...mono, fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 'bold', color: accent ? '#CC0066' : '#000080', lineHeight: 1.2 }}>
                    {value.toLocaleString()}
                  </div>
                  <div style={{ ...mono, fontSize: 10, marginTop: 4, color: '#555' }}>{label}</div>
                </div>
              ))}
            </div>
          </WinWindow>
        )}

        {/* ── Unified Scanner + Filter ── */}
        <WinWindow title="⚠ OCCUPATION_SCANNER.EXE" icon="🔎" style={{ marginBottom: 10 }}>
          <p style={{ ...mono, fontSize: 11, margin: '0 0 8px', color: '#000080' }}>
            {selectedCluster
              ? <>SEARCHING IN: <strong>{clusterPath(selectedCluster)}</strong></>
              : 'SEARCH FOLDERS OR SCAN FOR AN OCCUPATION:'
            }
          </p>

          <form onSubmit={handleCheck} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ ...mono, fontWeight: 'bold', fontSize: 13, whiteSpace: 'nowrap' }}>C:\&gt;</span>
            <input
              className="win-input"
              type="text"
              placeholder={
                selectedCluster
                  ? `Filter jobs in ${clusterShort(selectedCluster)}...`
                  : 'Type to filter folders, or SCAN for a specific job...'
              }
              value={checkQuery}
              onChange={e => { setCheckQuery(e.target.value); setCheckResults(null) }}
              style={{ flex: 1, minWidth: 160, fontSize: 12 }}
            />
            <button type="submit" className="win-btn" disabled={!checkQuery.trim() || loading} style={{ fontSize: 11 }}>
              SCAN JOB
            </button>
          </form>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 2 }}>
            {filters.map(({ key, label }) => (
              <button
                key={key}
                className={`win-tab${filter === key ? ' active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Scanner results */}
          {checkResults !== null && (
            <div style={{ marginTop: 10 }}>
              <div style={{ borderTop: '2px solid', borderColor: '#808080 #FFFFFF #FFFFFF #808080', paddingTop: 10 }} />
              {checkResults.length === 0 ? (
                <p style={{ ...mono, fontSize: 11, margin: 0, lineHeight: 1.8 }}>
                  &gt; No exact match found.<br />
                  &gt; Try a formal job title — e.g. "Physician" for Doctor, "Software Developer" for Programmer.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ ...mono, fontSize: 11, margin: '0 0 6px', color: '#000080' }}>
                    &gt; SCAN COMPLETE — {checkResults.length} RESULT{checkResults.length !== 1 ? 'S' : ''} FOUND:
                  </p>
                  {checkResults.map(job => (
                    <div key={job.code} className="win-inset" style={{ fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...mono, fontSize: 10, color: '#000080', fontWeight: 'bold', marginBottom: 3 }}>
                            {job.career_cluster.toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{job.occupation}</div>
                          <div style={{ ...mono, fontSize: 11, color: '#444', lineHeight: 1.5 }}>{job.description}</div>
                        </div>
                        <span className={job.at_risk ? 'badge-risk' : 'badge-safe'}>
                          {job.at_risk ? '⚠ AT RISK' : '✓ SAFE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </WinWindow>

        {/* ── MY_COMPUTER / Cluster view ── */}
        {!loading && (
          selectedCluster === null ? (

            /* ── Folder grid ── */
            <WinWindow
              title="MY_COMPUTER.EXE"
              icon="🖥"
              statusBar={`${visibleClusters.length} folder${visibleClusters.length !== 1 ? 's' : ''}`}
              bodyStyle={{ padding: 4, background: 'var(--window-bg)' }}
            >
              {visibleClusters.length === 0 ? (
                <div className="win-inset" style={{ margin: 4, padding: '24px', textAlign: 'center' }}>
                  <p style={{ ...mono, fontSize: 12, margin: '0 0 4px' }}>&gt; 0 folders found.</p>
                  <p style={{ ...mono, fontSize: 11, margin: 0, color: '#555' }}>Clear your search to see all clusters.</p>
                </div>
              ) : (
                <div className="folder-grid">
                  {visibleClusters.map(cluster => (
                    <div
                      key={cluster.name}
                      className="folder-item"
                      onClick={() => openCluster(cluster.name)}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && openCluster(cluster.name)}
                    >
                      <FolderIcon hasRisk={cluster.atRisk > 0} />
                      <span className="folder-label">{clusterShort(cluster.name)}</span>
                      <span className="folder-count">({cluster.total} jobs)</span>
                    </div>
                  ))}
                </div>
              )}
            </WinWindow>

          ) : (

            /* ── Cluster job list ── */
            <WinWindow
              title={`${clusterPath(selectedCluster)} — ${clusterJobs.length} object${clusterJobs.length !== 1 ? 's' : ''}`}
              icon="📁"
              statusBar={`${clusterJobs.length} object(s)  |  ${totalAtRiskInCluster} at risk`}
            >
              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 8, paddingBottom: 8,
                borderBottom: '2px solid', borderColor: '#808080 #FFFFFF #FFFFFF #808080',
                flexWrap: 'wrap',
              }}>
                <button className="win-btn" onClick={closeCluster} style={{ fontSize: 11, minWidth: 'unset', padding: '3px 10px' }}>
                  ← Back to My Computer
                </button>
                <span style={{ ...mono, fontSize: 11, color: '#555', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCluster}
                </span>
              </div>

              {clusterJobs.length === 0 ? (
                <div className="win-inset" style={{ padding: 20, textAlign: 'center' }}>
                  <p style={{ ...mono, fontSize: 12, margin: 0 }}>&gt; 0 files match current filter.</p>
                </div>
              ) : (
                <div className="job-file-list">
                  {clusterJobs.map(job => <JobFile key={job.code} job={job} />)}
                </div>
              )}
            </WinWindow>

          )
        )}

      </div>
    </div>
  )
}
