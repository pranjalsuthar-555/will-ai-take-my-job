export default function WinWindow({ title, icon, children, statusBar, style, bodyStyle }) {
  return (
    <div className="win-window" style={style}>
      <div className="win-title-bar">
        {icon && <span style={{ marginRight: 2 }}>{icon}</span>}
        <span className="win-title-text">{title}</span>
        <div className="win-controls">
          <button className="win-ctrl-btn" tabIndex={-1} aria-hidden>─</button>
          <button className="win-ctrl-btn" tabIndex={-1} aria-hidden>□</button>
          <button className="win-ctrl-btn" tabIndex={-1} aria-hidden>✕</button>
        </div>
      </div>
      <div className="win-body" style={bodyStyle}>
        {children}
      </div>
      {statusBar && (
        <div className="win-statusbar">
          <span className="win-statusbar-panel">{statusBar}</span>
        </div>
      )}
    </div>
  )
}
