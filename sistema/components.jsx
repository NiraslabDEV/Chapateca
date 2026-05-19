/* global React */
const { useState, useEffect, useRef } = React;

// ============================================================
// Brand glyph — an original mark for Chapateca
// stylized open-book with a leaf rising from the spine
// ============================================================
function BrandGlyph({ size = 32, color = "#C8952A" }) {
  return (
    <span className="brand-glyph" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        {/* book base */}
        <path d="M4 9 L15 12 L15 27 L4 24 Z" fill={color} opacity="0.85" />
        <path d="M28 9 L17 12 L17 27 L28 24 Z" fill={color} opacity="0.6" />
        <path d="M15 12 L16 11.4 L17 12 L17 27 L16 27.4 L15 27 Z" fill={color} />
        {/* leaf rising */}
        <path d="M16 11 C 13 6, 17 3, 21 4 C 20 7, 19 9, 16 11 Z" fill={color} opacity="0.9" />
        <path d="M16 11 C 17 8, 19 6, 21 4" stroke={color === "#C8952A" ? "#1C3A14" : "#fff"} strokeWidth="0.6" strokeLinecap="round" opacity="0.4" />
      </svg>
    </span>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ============================================================
// Icons (inline strokes — original, no third-party set)
// ============================================================
const Icon = {
  Home:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-5h-6v5a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2z"/></svg>,
  Book:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1 0-4h13"/></svg>,
  Target:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  Wallet:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="15" r="1.2" fill="currentColor"/></svg>,
  Camera:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></svg>,
  Settings:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  Help:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/></svg>,
  Lock:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  LockSmall:()=>  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  Bell:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  Chevron: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevRight:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="9 6 15 12 9 18"/></svg>,
  Search:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  Filter:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>,
  Upload:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>,
  Share:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4M8 13l8 4"/></svg>,
  Eye:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12"/><circle cx="12" cy="12" r="3"/></svg>,
  Download:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12M6 12l6 6 6-6"/><path d="M4 20h16"/></svg>,
  Plus:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  ArrowR:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  ArrowL:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  Copy:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>,
  Check:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>,
  Shield:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>,
  Wapp:    () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2 0 1.3.9 2.6 1.1 2.8.1.2 1.9 2.9 4.5 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>,
  Mail:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  Calendar:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  Pin:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 4 4-2 2 4 6-4 1-3-3-5 5v-5l5-5-3-3 2-2z"/></svg>,
  Folder:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
};

// ============================================================
// Role definitions
// ============================================================
const ROLES = {
  campo: {
    key: "campo",
    label: "Equipa de Campo",
    short: "Campo",
    badge: "campo",
    name: "Beatriz Nhantumbo",
    initials: "BN",
    email: "beatriz@chapateca.org",
    access: { galeria: true, manuais: true, estrategia: false, financas: false }
  },
  comunicacao: {
    key: "comunicacao",
    label: "Comunicação",
    short: "Comunicação",
    badge: "comunicacao",
    name: "Carlos Mucavele",
    initials: "CM",
    email: "carlos@chapateca.org",
    access: { galeria: true, manuais: true, estrategia: false, financas: false }
  },
  financas: {
    key: "financas",
    label: "Departamento Financeiro",
    short: "DAF",
    badge: "financas",
    name: "Sandra Mabunda",
    initials: "SM",
    email: "sandra@chapateca.org",
    access: { galeria: false, manuais: true, estrategia: false, financas: true }
  },
  direcao: {
    key: "direcao",
    label: "Direcção",
    short: "Direcção",
    badge: "direcao",
    name: "Lourenço Tembe",
    initials: "LT",
    email: "lourenco@chapateca.org",
    access: { galeria: true, manuais: true, estrategia: true, financas: true }
  }
};

// ============================================================
// Role badge
// ============================================================
function RoleBadge({ role, onDark }) {
  const r = ROLES[role];
  if (!r) return null;
  return (
    <span className={`role-badge ${r.badge}${onDark ? " on-dark" : ""}`}>
      <span className="dot"></span>
      {r.short}
    </span>
  );
}

// ============================================================
// Topbar
// ============================================================
function Topbar({ role, crumbs = [], onNotif }) {
  const r = ROLES[role];
  return (
    <div className="topbar app-topbar">
      <div className="topbar-brand">
        <BrandGlyph size={28} />
        <span className="wordmark">Chapateca</span>
      </div>
      {crumbs.length > 0 && (
        <div className="breadcrumb">
          <span>Portal</span>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              <span className="sep">›</span>
              <span className={i === crumbs.length - 1 ? "current" : ""}>{c}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notificações" onClick={onNotif}>
          <Icon.Bell />
          <span className="notif-dot">3</span>
        </button>
        <div className="avatar-pill" tabIndex="0">
          <div className="avatar">{r.initials}</div>
          <span className="name">{r.name.split(" ")[0]}</span>
          <RoleBadge role={role} onDark />
          <span className="chevron"><Icon.Chevron /></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sidebar
// ============================================================
function Sidebar({ role, current, onNav }) {
  const r = ROLES[role];
  const items = [
    { id: "dashboard", label: "Início",          icon: <Icon.Home />,    key: null },
    { id: "manuais",   label: "Manuais e Guias", icon: <Icon.Book />,    key: "manuais" },
    { id: "estrategia",label: "Estratégica",     icon: <Icon.Target />,  key: "estrategia" },
    { id: "financas",  label: "Financeiro",      icon: <Icon.Wallet />,  key: "financas" },
    { id: "galeria",   label: "Galeria Campo",   icon: <Icon.Camera />,  key: "galeria" },
  ];
  const secondary = [
    { id: "settings", label: "Definições", icon: <Icon.Settings /> },
    { id: "help",     label: "Ajuda",      icon: <Icon.Help /> },
  ];

  return (
    <aside className="sidebar app-sidebar">
      <div className="sidebar-profile">
        <div className="row">
          <div className="avatar md">{r.initials}</div>
          <div>
            <div className="name">{r.name}</div>
            <div className="email">{r.email}</div>
          </div>
        </div>
        <RoleBadge role={role} />
      </div>

      <div className="sidebar-section">
        {items.map(item => {
          const locked = item.key && !r.access[item.key];
          const active = current === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item${active ? " active" : ""}${locked ? " locked" : ""}`}
              onClick={() => locked ? onNav("denied") : onNav(item.id)}
              title={locked ? "Requer permissão de Direcção" : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              {locked && <span className="lock-icon"><Icon.LockSmall /></span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-section">
        {secondary.map(item => (
          <button
            key={item.id}
            className={`nav-item${current === item.id ? " active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}></div>
      <div className="sidebar-section">
        <div style={{ padding: "12px", fontSize: 11, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
          v1.0 · Maputo
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// Toast
// ============================================================
function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || "info"}`} role="alert">
          <div className="ticon">
            {t.type === "success" ? <Icon.Check /> : <Icon.Bell />}
          </div>
          <div style={{ flex: 1 }}>
            <div className="ttitle">{t.title}</div>
            {t.msg && <div className="tmsg">{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Simulated photo placeholders — striped, with monospace label
function PhotoThumb({ tone = 1, label }) {
  // generate a unique deterministic gradient
  const tones = [
    "linear-gradient(135deg, #6b8e5a 0%, #8aae72 100%)",
    "linear-gradient(135deg, #c8952a 0%, #e5b84a 100%)",
    "linear-gradient(135deg, #3D6B2A 0%, #5a8d3e 100%)",
    "linear-gradient(135deg, #8B6F47 0%, #b08d5e 100%)",
    "linear-gradient(135deg, #5a3a8b 0%, #7b54b8 100%)",
    "linear-gradient(135deg, #1A5C8A 0%, #2a7eb8 100%)",
  ];
  const bg = tones[tone % tones.length];
  return (
    <div className="thumb" style={{ background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {label && <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "rgba(255,255,255,0.7)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "2px 6px",
        background: "rgba(0,0,0,0.2)",
        borderRadius: 4,
      }}>{label}</span>}
    </div>
  );
}

// Expose
Object.assign(window, { BrandGlyph, GoogleG, Icon, ROLES, RoleBadge, Topbar, Sidebar, Toast, PhotoThumb });
