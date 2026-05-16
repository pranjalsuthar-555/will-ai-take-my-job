import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import WinWindow from './WinWindow'
import JobCard from './JobCard'

const PAGE_SIZE = 12

export default function App() {
  const [jobs, setJobs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('all')
  const [checkQuery, setCheckQuery]     = useState('')
  const [checkResults, setCheckResults] = useState(null)
  const [visible, setVisible]           = useState(PAGE_SIZE)

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

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter(job => {
      if (filter === 'at-risk' && !job.at_risk) return false
      if (filter === 'safe'    &&  job.at_risk) return false
      if (q) return (
        job.occupation.toLowerCase().includes(q) ||
        job.career_cluster.toLowerCase().includes(q) ||
        job.career_pathway.toLowerCase().includes(q)
      )
      return true
    })
  }, [jobs, search, filter])

  useEffect(() => { setVisible(PAGE_SIZE) }, [filteredJobs])

  const stats = useMemo(() => ({
    total:    jobs.length,
    atRisk:   jobs.filter(j => j.at_risk).length,
    clusters: new Set(jobs.map(j => j.career_cluster)).size,
  }), [jobs])

  function handleCheck(e) {
    e.preventDefault()
    const q = checkQuery.trim()
    if (!q) return
    const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 1)
    const results = fuse.search(q, { limit: 10 })
      .map(r => r.item)
      .filter(job => words.some(w => job.occupation.toLowerCase().includes(w)))
      .slice(0, 3)
    setCheckResults(results)
  }

  const visibleJobs = filteredJobs.slice(0, visible)
  const hasMore     = visible < filteredJobs.length
  const hasFilters  = search || filter !== 'all'

  const mono = { fontFamily: "'Courier New', Courier, monospace" }

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
            <h1 style={{
              fontSize: 'clamp(13px, 2.5vw, 20px)',
              color: '#000080',
              margin: '0 0 20px',
              letterSpacing: 1,
            }}>
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
                { value: stats.total,    label: 'TOTAL JOBS'           },
                { value: stats.atRisk,   label: 'AT-RISK JOBS', accent: true },
                { value: stats.clusters, label: 'CLUSTERS'             },
              ].map(({ value, label, accent }) => (
                <div key={label} className="win-inset" style={{ textAlign: 'center' }}>
                  <div style={{
                    ...mono,
                    fontSize: 'clamp(18px, 3vw, 28px)',
                    fontWeight: 'bold',
                    color: accent ? '#CC0066' : '#000080',
                    lineHeight: 1.2,
                  }}>
                    {value.toLocaleString()}
                  </div>
                  <div style={{ ...mono, fontSize: 10, marginTop: 4, color: '#555' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </WinWindow>
        )}

        {/* ── Search + Filter ── */}
        <WinWindow title="SEARCH_AND_FILTER.EXE" icon="🔍" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ ...mono, fontSize: 12, whiteSpace: 'nowrap', color: '#000080', fontWeight: 'bold' }}>
              Address:
            </span>
            <input
              className="win-input"
              type="text"
              placeholder="Search occupations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 12 }}
            />
          </div>
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
        </WinWindow>

        {/* ── Occupation Scanner ── */}
        <WinWindow title="⚠ OCCUPATION_SCANNER.EXE" icon="🔎" style={{ marginBottom: 10 }}>
          <p style={{ ...mono, fontSize: 11, margin: '0 0 8px', color: '#000080' }}>
            ENTER OCCUPATION TO SCAN:
          </p>
          <form onSubmit={handleCheck} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ ...mono, fontWeight: 'bold', fontSize: 13, whiteSpace: 'nowrap' }}>
              C:\&gt;
            </span>
            <input
              className="win-input"
              type="text"
              placeholder="e.g. Graphic Designer, Accountant..."
              value={checkQuery}
              onChange={e => { setCheckQuery(e.target.value); setCheckResults(null) }}
              style={{ flex: 1, minWidth: 180, fontSize: 12 }}
            />
            <button type="submit" className="win-btn" disabled={!checkQuery.trim() || loading}>
              SCAN JOB
            </button>
          </form>

          {checkResults !== null && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                borderTop: '2px solid',
                borderColor: '#808080 #FFFFFF #FFFFFF #808080',
                paddingTop: 10,
              }} />
              {checkResults.length === 0 ? (
                <p style={{ ...mono, fontSize: 11, margin: 0, lineHeight: 1.8 }}>
                  &gt; ERROR: No match found.<br />
                  &gt; Try the full job title (e.g. "Graphic Designer" not "designer").
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
                          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {job.occupation}
                          </div>
                          <div style={{ ...mono, fontSize: 11, color: '#444', lineHeight: 1.5 }}>
                            {job.description}
                          </div>
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

        {/* ── Jobs File Browser ── */}
        {!loading && (
          <WinWindow
            title={`📁 C:\\CAREERS\\ (${filteredJobs.length} item${filteredJobs.length !== 1 ? 's' : ''})`}
            icon="📁"
            statusBar={`Showing ${visibleJobs.length.toLocaleString()} of ${filteredJobs.length.toLocaleString()} occupations`}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: '2px solid',
              borderColor: '#808080 #FFFFFF #FFFFFF #808080',
              flexWrap: 'wrap',
            }}>
              <span style={{ ...mono, fontSize: 11, color: '#444' }}>
                📁 C:\CAREERS\{hasFilters ? ' [FILTERED]' : ''}
              </span>
              {hasFilters && (
                <button
                  className="win-btn"
                  onClick={() => { setSearch(''); setFilter('all') }}
                  style={{ minWidth: 'unset', fontSize: 11, padding: '2px 10px' }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="win-inset" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ ...mono, fontSize: 12, margin: '0 0 6px' }}>&gt; 0 objects found.</p>
                <p style={{ ...mono, fontSize: 11, margin: 0, color: '#555' }}>Broaden your search or clear filters.</p>
              </div>
            ) : (
              <>
                <div className="job-grid">
                  {visibleJobs.map(job => <JobCard key={job.code} job={job} />)}
                </div>
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <button
                      className="win-btn"
                      onClick={() => setVisible(v => v + PAGE_SIZE)}
                      style={{ minWidth: 180 }}
                    >
                      LOAD_MORE.exe ({filteredJobs.length - visible} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </WinWindow>
        )}

      </div>
    </div>
  )
}
