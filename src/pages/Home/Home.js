import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiClock,
  FiCreditCard,
  FiDatabase,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth, ROLE_LABELS, ROLES } from "../../context/AuthContext";
import AxiaBatLogo from "../../Components/FirstPage/logo2.png";
import "./Home.css";

const navigationItems = [
  { label: "Home", icon: FiGrid, route: "/home" },
  { label: "Projets", icon: FiFolder, route: "/Project3" },
  { label: "Journal", icon: FiBookOpen, route: "/JournalChantier" },
  { label: "Délais", icon: FiClock, route: "/Délais" },
  { label: "Budget", icon: FiCreditCard, route: "/BudgetDashboard" },
  { label: "Tableau de bord", icon: FiGrid, route: "/FirstPage" },
  { label: "Reporting", icon: FiFileText, route: "/Rapport" },
  { label: "Base de données", icon: FiDatabase, route: "/BaseDeDonnees" },
];

const modules = [
  {
    icon: FiFolder,
    title: "Gestion des projets",
    description: "Créer, organiser et suivre les projets BTP.",
    route: "/Project3",
    tone: "blue",
  },
  {
    icon: FiBookOpen,
    title: "Journal de chantier",
    description: "Enregistrer et suivre les activités quotidiennes du chantier.",
    route: "/JournalChantier",
    tone: "green",
  },
  {
    icon: FiClock,
    title: "Gestion des délais",
    description: "Suivre les délais contractuels, les arrêts et les retards.",
    route: "/Délais",
    tone: "orange",
  },
  {
    icon: FiCreditCard,
    title: "Suivi budgétaire",
    description: "Suivre les coûts, dépenses, engagements et écarts.",
    route: "/BudgetDashboard",
    tone: "purple",
  },
  {
    icon: FiGrid,
    title: "Tableau de bord",
    description: "Visualiser les indicateurs clés et l'état général des projets.",
    route: "/FirstPage",
    tone: "navy",
    actionLabel: "Accéder au tableau de bord",
  },
  {
    icon: FiFileText,
    title: "Reporting",
    description: "Analyser les performances et générer les rapports de suivi.",
    route: "/Rapport",
    tone: "teal",
  },
  {
    icon: FiDatabase,
    title: "Base de données",
    description: "Accéder aux données de référence utilisées par AXIABAT.",
    route: "/BaseDeDonnees",
    tone: "slate",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const userName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Utilisateur";
  const role = userProfile?.role || ROLES.VIEWER;
  const roleLabel = ROLE_LABELS[role] || "Utilisateur";
  const initials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const goTo = (route) => {
    setMenuOpen(false);
    navigate(route);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="home-shell">
      <header className="home-header">
        <button
          className="home-menu-button"
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen(true)}
        >
          <FiMenu />
        </button>
        <button className="home-brand" type="button" onClick={() => goTo("/home")}>
          <img src={AxiaBatLogo} alt="AXIABAT" />
        </button>

        <nav className={`home-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navigation principale">
          <div className="home-nav-mobile-header">
            <span>Navigation</span>
            <button type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}>
              <FiX />
            </button>
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.route;
            return (
              <button
                key={item.route}
                type="button"
                className={`home-nav-link ${active ? "active" : ""}`}
                onClick={() => goTo(item.route)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {menuOpen && (
          <button
            className="home-nav-backdrop"
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div className="home-user">
          <div className="home-avatar">{initials || <FiUser />}</div>
          <div className="home-user-copy">
            <strong>{userName}</strong>
            <span>{roleLabel}</span>
          </div>
          <button type="button" className="home-logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-eyebrow">PLATEFORME AXIABAT</span>
            <h1>Bienvenue sur AXIABAT</h1>
            <p className="home-tagline">Plateforme intégrée de gestion des projets BTP</p>
            <p className="home-intro">
              AXIABAT est une plateforme digitale destinée à centraliser, piloter et suivre les projets BTP,
              les travaux, les délais, les coûts, les indicateurs et le reporting.
            </p>
            <p className="home-promise">Pilotez vos projets BTP depuis une plateforme unique.</p>
          </div>
          <div className="home-hero-mark" aria-hidden="true">
            <span>⬡</span>
            <strong>AXIABAT</strong>
            <small>INGÉNIERIE · DIGITALISATION · PERFORMANCE</small>
          </div>
        </section>

        <section className="home-section-heading">
          <div>
            <span className="home-eyebrow">ESPACE DE TRAVAIL</span>
            <h2>Accédez à vos modules</h2>
          </div>
          <p>Choisissez une rubrique pour commencer ou poursuivre votre activité.</p>
        </section>

        <section className="home-module-grid" aria-label="Modules AXIABAT">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article className="home-module-card" key={module.route}>
                <div className={`home-module-icon ${module.tone}`}><Icon /></div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <button type="button" onClick={() => goTo(module.route)}>
                  {module.actionLabel || "Accéder"}
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}