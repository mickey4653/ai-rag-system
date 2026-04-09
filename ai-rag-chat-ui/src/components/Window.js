import { useRef } from "react";
import Draggable from "react-draggable";
import "./Window.css";

function Window({ title, icon, children, minimized, zIndex, onClose, onMinimize, onFocus }) {
  const nodeRef = useRef(null);

  if (minimized) return null;

  return (
    <Draggable handle=".window__titlebar" defaultPosition={{ x: 150, y: 80 }} nodeRef={nodeRef}>
      <div className="window" style={{ zIndex }} onMouseDown={onFocus} ref={nodeRef}>
        <div className="window__titlebar">
          <span className="window__title">{icon} {title}</span>
          <div className="window__controls">
            <button className="window__btn window__btn--minimize" onClick={onMinimize}>−</button>
            <button className="window__btn window__btn--close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="window__content">{children}</div>
      </div>
    </Draggable>
  );
}

export default Window;
