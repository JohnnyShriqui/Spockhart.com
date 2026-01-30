import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tldraw, createTLStore, defaultShapeUtils, exportToBlob } from "tldraw";
import "tldraw/tldraw.css";
import { FLOW } from "./flow.js";

function nowId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function buildRevealText(path) {
  // Different reveals depending on where they went.
  const last = path[path.length - 1];
  const map = {
    handoffs: "Work is slowing down in handoffs. That’s usually a design issue: unclear ownership + messy interfaces.",
    approvals: "Time is disappearing into waiting. That’s usually missing decision rules and lightweight governance.",
    rework: "You’ve got a rework loop. That’s usually unclear inputs and a process that can’t catch errors early.",
    manual: "Manual copying is creating errors. That’s usually a good automation candidate after the process is clean.",
    inconsistent: "Quality is drifting. That’s usually missing standards, checks, and feedback loops.",
    ramp: "Ramp time is high. That’s usually knowledge trapped in people instead of the system.",
    bottleneck: "Flow depends on one person. That’s usually a structure problem, not a motivation problem."
  };
  return map[last] || "You’re seeing friction in flow. That’s usually a system constraint showing up under pressure.";
}

export default function App() {
  const [stepId, setStepId] = useState("start");
  const [path, setPath] = useState(["start"]);
  const editorRef = useRef(null);

  const store = useMemo(() => createTLStore({ shapeUtils: defaultShapeUtils }), []);

  const step = FLOW[stepId];

  const addWhiteboardMoment = async (nextId) => {
    const editor = editorRef.current;
    if (!editor) return;

    // First time: lay down a simple "system sketch" frame.
    if (path.length === 1) {
      editor.createShapes([
        {
          id: nowId("box"),
          type: "geo",
          x: 140,
          y: 120,
          props: { geo: "rectangle", w: 280, h: 90, text: "Reality\n(what’s happening)" }
        },
        {
          id: nowId("box"),
          type: "geo",
          x: 520,
          y: 120,
          props: { geo: "rectangle", w: 280, h: 90, text: "Desired\n(what you want)" }
        },
        {
          id: nowId("arrow"),
          type: "arrow",
          x: 420,
          y: 165,
          props: { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } }
        }
      ]);

      editor.zoomToFit();
      return;
    }

    // Add a new sticky-ish note per choice
    const labels = {
      slow: "Slow flow",
      errors: "Errors",
      ownership: "Unclear ownership",
      growth: "Growth pressure",
      handoffs: "Handoffs",
      approvals: "Waiting",
      rework: "Rework loop",
      manual: "Manual copying",
      inconsistent: "Inconsistent quality",
      ramp: "Ramp / onboarding",
      bottleneck: "Single-person bottleneck",
      reveal: "Pattern",
      download: "Snapshot"
    };

    const text = labels[nextId] || nextId;

    const x = 140 + (path.length % 3) * 320;
    const y = 280 + Math.floor(path.length / 3) * 160;

    editor.createShapes([
      {
        id: nowId("note"),
        type: "geo",
        x,
        y,
        props: { geo: "rectangle", w: 280, h: 110, text }
      }
    ]);

    // Gentle camera: zoom to fit after each addition.
    editor.zoomToFit();
  };

  const go = async (next) => {
    setStepId(next);
    setPath((p) => [...p, next]);
    await addWhiteboardMoment(next);
  };

  const restart = async () => {
    setStepId("start");
    setPath(["start"]);
    const editor = editorRef.current;
    if (editor) {
      editor.deleteShapes(editor.getCurrentPageShapeIds());
      editor.zoomToFit();
    }
  };

  const downloadSnapshot = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const blob = await exportToBlob({
      editor,
      format: "png",
      opts: { background: true, scale: 2 }
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spockhart-snapshot.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  const revealText = stepId === "reveal" ? buildRevealText(path) : null;

  return (
    <div className="shell">
      <div className="left">
        <div className="brand">
          Spockhart <span className="pill">half logic • half human</span>
        </div>

        <div className="card">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="prompt">{step.prompt}</div>
              <div className="muted" style={{ marginTop: 8 }}>{step.note}</div>

              {revealText && (
                <div className="card" style={{ marginTop: 12 }}>
                  <div className="muted">Reflection</div>
                  <div style={{ marginTop: 6, lineHeight: 1.35 }}>{revealText}</div>
                </div>
              )}

              <div className="choices">
                {step.choices.map((c) => (
                  <button
                    key={c.label}
                    className="choice"
                    onClick={async () => {
                      if (c.next === "start") return restart();
                      if (c.next === "download") return downloadSnapshot();
                      return go(c.next);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="footerRow">
          <button className="secondary" onClick={restart}>Restart</button>
          <button className="secondary" onClick={downloadSnapshot}>Download snapshot</button>
        </div>

        <div className="muted">
          No forms. No popups. You should be able to leave with value.
        </div>
      </div>

      <div className="right">
        <div className="canvasFrame">
          <Tldraw
            store={store}
            onMount={(editor) => {
              editorRef.current = editor;
              // Start clean + fit view
              editor.zoomToFit();
            }}
          />
        </div>
      </div>
    </div>
  );
}
