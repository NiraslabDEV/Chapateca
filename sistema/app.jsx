/* global React, ReactDOM,
   ROLES, Topbar, Sidebar, Toast,
   LoginScreen, DashboardScreen, GaleriaScreen, UploadScreen, ShareScreen,
   ManuaisScreen, EstrategiaScreen, FinancasScreen, DeniedScreen, SettingsScreen,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakButton */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "role": "campo",
  "showAuthed": true,
  "fontPair": "dm",
  "accentSwap": "default"
}/*EDITMODE-END*/;

const SCREEN_CRUMBS = {
  dashboard:  [],
  galeria:    ["Galeria do Terreno"],
  upload:     ["Galeria", "Carregar Fotos"],
  share:      ["Galeria", "Partilhar"],
  manuais:    ["Manuais e Guias"],
  estrategia: ["Gestão Estratégica"],
  financas:   ["Financeiro"],
  denied:     ["Acesso negado"],
  settings:   ["Definições"],
  help:       ["Ajuda"]
};

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const role = tweaks.role;
  const setRole = (r) => setTweak({ role: r });

  const [authed, setAuthed] = React.useState(tweaks.showAuthed);
  const [screen, setScreen] = React.useState("dashboard");
  const [navParams, setNavParams] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);

  // sync tweak -> authed (so user can toggle the login state too)
  React.useEffect(() => {
    setAuthed(tweaks.showAuthed);
  }, [tweaks.showAuthed]);

  const addToast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  };

  const onNav = (next, params) => {
    setNavParams(params || null);
    setScreen(next);
    // scroll main to top
    requestAnimationFrame(() => {
      document.querySelector(".app-main")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const onLogin = () => {
    setTweak({ showAuthed: true });
    setAuthed(true);
    setScreen("dashboard");
    setTimeout(() => {
      addToast({ type: "success", title: `Olá, ${ROLES[role].name.split(" ")[0]}!`, msg: "Sessão iniciada com sucesso." });
    }, 300);
  };

  const onLogout = () => {
    setTweak({ showAuthed: false });
    setAuthed(false);
    setScreen("dashboard");
  };

  // Apply font pair
  React.useEffect(() => {
    const root = document.documentElement;
    if (tweaks.fontPair === "dm") {
      root.style.setProperty("--font-display", '"DM Serif Display", Georgia, serif');
      root.style.setProperty("--font-body", '"DM Sans", -apple-system, sans-serif');
    } else if (tweaks.fontPair === "playfair") {
      root.style.setProperty("--font-display", '"Playfair Display", Georgia, serif');
      root.style.setProperty("--font-body", '"Manrope", -apple-system, sans-serif');
    } else if (tweaks.fontPair === "fraunces") {
      root.style.setProperty("--font-display", '"Fraunces", Georgia, serif');
      root.style.setProperty("--font-body", '"Outfit", -apple-system, sans-serif');
    }
  }, [tweaks.fontPair]);

  // Apply accent swap
  React.useEffect(() => {
    const root = document.documentElement;
    if (tweaks.accentSwap === "default") {
      root.style.setProperty("--color-forest", "#1C3A14");
      root.style.setProperty("--color-forest-mid", "#2D5220");
      root.style.setProperty("--color-forest-light", "#3D6B2A");
      root.style.setProperty("--color-gold", "#C8952A");
    } else if (tweaks.accentSwap === "terracotta") {
      root.style.setProperty("--color-forest", "#2A1B14");
      root.style.setProperty("--color-forest-mid", "#3D2A1F");
      root.style.setProperty("--color-forest-light", "#5C4030");
      root.style.setProperty("--color-gold", "#D67341");
    } else if (tweaks.accentSwap === "indigo") {
      root.style.setProperty("--color-forest", "#1A2147");
      root.style.setProperty("--color-forest-mid", "#2B3568");
      root.style.setProperty("--color-forest-light", "#4351A0");
      root.style.setProperty("--color-gold", "#D4A24C");
    }
  }, [tweaks.accentSwap]);

  // Render
  if (!authed) {
    return (
      <>
        <LoginScreen onLogin={onLogin} role={role} setRole={setRole} />
        <Toast toasts={toasts} />
        <TweaksPanelHost tweaks={tweaks} setTweak={setTweak} authed={authed} />
      </>
    );
  }

  const renderScreen = () => {
    const r = ROLES[role];
    switch (screen) {
      case "dashboard": return <DashboardScreen role={role} onNav={onNav} />;
      case "galeria":
        return r.access.galeria
          ? <GaleriaScreen role={role} onNav={onNav} />
          : <DeniedScreen role={role} onNav={onNav} />;
      case "upload":
        return r.access.galeria
          ? <UploadScreen onNav={onNav} navParams={navParams} />
          : <DeniedScreen role={role} onNav={onNav} />;
      case "share":
        return r.access.galeria
          ? <ShareScreen onNav={onNav} addToast={addToast} />
          : <DeniedScreen role={role} onNav={onNav} />;
      case "manuais": return <ManuaisScreen role={role} />;
      case "estrategia":
        return r.access.estrategia
          ? <EstrategiaScreen />
          : <DeniedScreen role={role} onNav={onNav} />;
      case "financas":
        return r.access.financas
          ? <FinancasScreen />
          : <DeniedScreen role={role} onNav={onNav} />;
      case "denied": return <DeniedScreen role={role} onNav={onNav} />;
      case "settings": return <SettingsScreen role={role} onLogout={onLogout} />;
      case "help":
        return (
          <div data-screen-label="11 Ajuda">
            <div className="page-head">
              <h1 className="page-title">Ajuda</h1>
              <p className="page-subtitle">Recursos para usar o portal</p>
            </div>
            <div className="settings-stack">
              <div className="settings-card">
                <h3>Como carregar fotos</h3>
                <p style={{ color: "var(--color-ink-mid)" }}>Vai a Galeria → "Carregar Fotos". Segue os 3 passos: seleccionar, descrever, enviar.</p>
              </div>
              <div className="settings-card">
                <h3>Como partilhar com doadores</h3>
                <p style={{ color: "var(--color-ink-mid)" }}>Em qualquer álbum, clica em "Partilhar". O sistema gera um link seguro que podes enviar por WhatsApp ou Email.</p>
              </div>
              <div className="settings-card">
                <h3>Suporte técnico</h3>
                <p style={{ color: "var(--color-ink-mid)" }}>Escreve para <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-forest)" }}>suporte@chapateca.org</span> ou liga para a sede.</p>
              </div>
            </div>
          </div>
        );
      default: return <DashboardScreen role={role} onNav={onNav} />;
    }
  };

  return (
    <>
      <div className="app app-with-chrome">
        <Topbar role={role} crumbs={SCREEN_CRUMBS[screen] || []} onNotif={() => addToast({ type: "info", title: "3 novas notificações", msg: "Beatriz fez upload · Carlos partilhou um link..." })} />
        <Sidebar role={role} current={screen} onNav={onNav} />
        <main className="app-main">
          <div key={screen} style={{ animation: "pageIn 0.25s ease-out" }}>
            {renderScreen()}
          </div>
        </main>
      </div>
      <Toast toasts={toasts} />
      <TweaksPanelHost tweaks={tweaks} setTweak={setTweak} authed={authed} />
    </>
  );
}

function TweaksPanelHost({ tweaks, setTweak, authed }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Perfil activo">
        <TweakSelect
          label="Papel do utilizador"
          value={tweaks.role}
          onChange={(v) => setTweak({ role: v })}
          options={[
            { value: "campo", label: "Equipa de Campo (Beatriz)" },
            { value: "comunicacao", label: "Comunicação (Carlos)" },
            { value: "financas", label: "DAF · Finanças (Sandra)" },
            { value: "direcao", label: "Direcção (Lourenço)" }
          ]}
        />
        <div style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 6, lineHeight: 1.5 }}>
          Cada papel vê módulos diferentes e diferentes níveis de acesso.
        </div>
      </TweakSection>

      <TweakSection label="Sessão">
        <TweakToggle
          label="Iniciar sessão"
          value={tweaks.showAuthed}
          onChange={(v) => setTweak({ showAuthed: v })}
        />
      </TweakSection>

      <TweakSection label="Tipografia">
        <TweakRadio
          label="Par tipográfico"
          value={tweaks.fontPair}
          onChange={(v) => setTweak({ fontPair: v })}
          options={[
            { value: "dm", label: "DM Serif + Sans" },
            { value: "playfair", label: "Playfair + Manrope" },
            { value: "fraunces", label: "Fraunces + Outfit" }
          ]}
        />
      </TweakSection>

      <TweakSection label="Paleta">
        <TweakRadio
          label="Tom"
          value={tweaks.accentSwap}
          onChange={(v) => setTweak({ accentSwap: v })}
          options={[
            { value: "default", label: "Floresta + Ocre" },
            { value: "terracotta", label: "Café + Terracota" },
            { value: "indigo", label: "Índigo + Mostarda" }
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
