import "./Desktop.css";

function Desktop({ onOpenApp, apps }) {
  return (
    <div className="desktop">
      <div className="desktop__icons">
        {Object.entries(apps).map(([id, app]) => (
          <div
            key={id}
            className="desktop__icon"
            onDoubleClick={() => onOpenApp(id)}
          >
            <span className="desktop__icon-emoji">{app.icon}</span>
            <span className="desktop__icon-label">{app.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Desktop;
