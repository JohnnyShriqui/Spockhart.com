// Small, non-generic, warm starter flow.
// Goal: show "being heard" + "whiteboard organizes thoughts".

export const FLOW = {
  start: {
    id: "start",
    prompt: "What brings you here?",
    note: "No email. No follow-up. This is just a quick thinking exercise.",
    choices: [
      { label: "Things take too long", next: "slow" },
      { label: "Mistakes keep happening", next: "errors" },
      { label: "Ownership is unclear", next: "ownership" },
      { label: "Growth is breaking us", next: "growth" }
    ]
  },

  slow: {
    id: "slow",
    prompt: "Where does work pile up?",
    note: "We’ll sketch what you tell us. You’ll see it organize in real time.",
    choices: [
      { label: "Handoffs between people/teams", next: "handoffs" },
      { label: "Approvals and waiting", next: "approvals" },
      { label: "Rework / unclear requirements", next: "rework" }
    ]
  },

  errors: {
    id: "errors",
    prompt: "When do mistakes usually show up?",
    note: "No judgement. This is just pattern-finding.",
    choices: [
      { label: "Manual data entry / copying", next: "manual" },
      { label: "Inconsistent process steps", next: "inconsistent" },
      { label: "New hires ramp slowly", next: "ramp" }
    ]
  },

  ownership: {
    id: "ownership",
    prompt: "What does it feel like day-to-day?",
    note: "If you’ve been carrying this, that’s exhausting.",
    choices: [
      { label: "Too many “who owns this?” moments", next: "handoffs" },
      { label: "Decisions get stuck", next: "approvals" },
      { label: "Everything routes through one person", next: "bottleneck" }
    ]
  },

  growth: {
    id: "growth",
    prompt: "What’s breaking first as you grow?",
    note: "This is common. Systems that worked at 5 people break at 15.",
    choices: [
      { label: "Hiring / onboarding is chaotic", next: "ramp" },
      { label: "Customer delivery is inconsistent", next: "inconsistent" },
      { label: "Coordination and handoffs", next: "handoffs" }
    ]
  },

  // End nodes (we’ll vary the reveal text based on path)
  handoffs: { id: "handoffs", prompt: "Got it. Let’s show the handoffs.", note: "We’ll highlight the friction point.", choices: [{ label: "Show me the pattern", next: "reveal" }] },
  approvals: { id: "approvals", prompt: "Got it. Let’s show the waiting.", note: "We’ll highlight where time disappears.", choices: [{ label: "Show me the pattern", next: "reveal" }] },
  rework: { id: "rework", prompt: "Got it. Let’s show the rework loop.", note: "We’ll highlight where clarity breaks.", choices: [{ label: "Show me the pattern", next: "reveal" }] },
  manual: { id: "manual", prompt: "Got it. Let’s show the manual points.", note: "We’ll highlight where errors creep in.", choices: [{ label: "Show me the pattern", next: "reveal" }] },
  inconsistent: { id: "inconsistent", prompt: "Got it. Let’s show inconsistency.", note: "We’ll highlight where quality drifts.", choices: [{ label: "Show me the pattern", next: "reveal" }] },
  ramp: { id: "ramp", prompt: "Got it. Let’s show ramp time.", note: "We’ll highlight where knowledge is trapped.", choices: [{ label: "Show me the pattern", next: "reveal" }] },
  bottleneck: { id: "bottleneck", prompt: "Got it. Let’s show the bottleneck.", note: "We’ll highlight where flow depends on one person.", choices: [{ label: "Show me the pattern", next: "reveal" }] },

  reveal: {
    id: "reveal",
    prompt: "Here’s the pattern we’re seeing.",
    note: "This isn’t a full diagnosis. It’s a clean reflection of what you said.",
    choices: [
      { label: "Download this snapshot", next: "download" },
      { label: "Restart", next: "start" }
    ]
  },

  download: {
    id: "download",
    prompt: "Nice. No gates.",
    note: "If you want, you can book a chat — but you should be able to leave with value either way.",
    choices: [
      { label: "Restart", next: "start" }
    ]
  }
};
