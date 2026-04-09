import { useState } from "react";
import Desktop from "./components/Desktop";
import Taskbar from "./components/Taskbar";
import Window from "./components/Window";
import ChatApp from "./apps/ChatApp";
import FileManagerApp from "./apps/FileManagerApp";
import WorkflowApp from "./apps/WorkflowApp";
import HistoryApp from "./apps/HistoryApp";
import { ToastProvider } from "./components/ToastContext";
import "./components/Toast.css";
import "./App.css";

const APPS = {
  chat: { title: "AI Chat", icon: "💬", component: ChatApp },
  files: { title: "File Manager", icon: "📂", component: FileManagerApp },
  workflow: { title: "Workflows", icon: "⚙️", component: WorkflowApp },
  history: { title: "History", icon: "🕓", component: HistoryApp },
};

function App() {
  const [openWindows, setOpenWindows] = useState([]);

  const openApp = (appId) => {
    if (openWindows.find((w) => w.id === appId)) {
      focusWindow(appId);
      return;
    }
    setOpenWindows((prev) => [
      ...prev,
      { id: appId, minimized: false, zIndex: prev.length + 1 },
    ]);
  };

  const closeWindow = (appId) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== appId));
  };

  const minimizeWindow = (appId) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === appId ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const focusWindow = (appId) => {
    setOpenWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) =>
        w.id === appId ? { ...w, zIndex: maxZ + 1, minimized: false } : w
      );
    });
  };

  return (
    <ToastProvider>
      <div className="os-container">
        <Desktop onOpenApp={openApp} apps={APPS} />
      {openWindows.map((win) => {
        const app = APPS[win.id];
        const AppComponent = app.component;
        return (
          <Window
            key={win.id}
            title={app.title}
            icon={app.icon}
            minimized={win.minimized}
            zIndex={win.zIndex}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onFocus={() => focusWindow(win.id)}
          >
            <AppComponent />
          </Window>
        );
      })}
      <Taskbar
        apps={APPS}
        openWindows={openWindows}
        onAppClick={openApp}
        onWindowClick={minimizeWindow}
      />
    </div>
    </ToastProvider>
  );
}

export default App;
