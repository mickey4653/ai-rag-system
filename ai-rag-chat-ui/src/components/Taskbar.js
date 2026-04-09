import "./Taskbar.css";

function Taskbar({ apps, openWindows, onAppClick, onWindowClick }) {
  return (
    <div className="taskbar">
      <div className="taskbar__start">
        <span className="taskbar__logo">🤖 AI RAG OS</span>
      </div>
      <div className="taskbar__windows">
        {openWindows.map((win) => {
          const app = apps[win.id];
          return (
            <button
              key={win.id}
              className={`taskbar__window-btn ${win.minimized ? "minimized" : ""}`}
              onClick={() => onWindowClick(win.id)}
            >
              {app.icon} {app.title}
            </button>
          );
        })}
      </div>
      <div className="taskbar__apps">
        {Object.entries(apps).map(([id, app]) => (
          <button
            key={id}
            className="taskbar__app-btn"
            onClick={() => onAppClick(id)}
            title={app.title}
          >
            {app.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Taskbar;
