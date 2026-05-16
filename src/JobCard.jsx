import WinWindow from './WinWindow'

function toFilename(occupation) {
  return occupation
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 18) + '.TXT'
}

function toPath(cluster) {
  const first = cluster.split(/[\s,&\/]/)[0].toUpperCase()
  return 'C:\\' + first + '\\'
}

export default function JobCard({ job }) {
  return (
    <WinWindow
      title={toFilename(job.occupation)}
      icon="📄"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}
    >
      {/* file path / cluster */}
      <div style={{ color: '#000080', fontWeight: 'bold', fontSize: 11 }}>
        {toPath(job.career_cluster)}
      </div>

      {/* occupation title */}
      <div style={{ fontWeight: 'bold', fontSize: 12, lineHeight: 1.4 }}>
        {job.occupation}
      </div>

      {/* description */}
      <div className="line-clamp-2" style={{
        color: '#444',
        fontSize: 11,
        lineHeight: 1.6,
        flex: 1,
      }}>
        {job.description}
      </div>

      {/* badge */}
      <div>
        <span className={job.at_risk ? 'badge-risk' : 'badge-safe'}>
          {job.at_risk ? '⚠ AT RISK' : '✓ SAFE'}
        </span>
      </div>
    </WinWindow>
  )
}
