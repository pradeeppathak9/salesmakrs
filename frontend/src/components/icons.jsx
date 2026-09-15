const base = {
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

export function IconBox(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

export function IconStore(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9 4.5 4h15L21 9" />
      <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" />
      <path d="M9 20v-5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 6" />
      <path d="M17.5 14.2c2.6.4 4.5 2.7 4.5 5.8" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconLogOut(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconInbox(props) {
  return (
    <svg {...base} {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.4 5h13.2L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.4 5Z" />
    </svg>
  );
}

export function IconClipboard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6M9 19h3" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}
