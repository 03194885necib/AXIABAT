import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiDatabase,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth, ROLE_LABELS, ROLES } from "../../context/AuthContext";
import { db } from "../../firebase";
import AxiaBatLogo from "./logo2.png";
import "./FirstPage.css";

const navigationItems = [
  { key: "dashboard", label: "Tableau de bord", icon: FiGrid, route: "/FirstPage" },
  { key: "projects", label: "Projets", icon: FiFolder, route: "/Project3" },
  { key: "journal", label: "Journal de chantier", icon: FiBookOpen, route: "/JournalChantier" },
  { key: "delais", label: "Gestion des délais", icon: FiClock, route: "/Délais" },
  { key: "budget", label: "Suivi budgétaire", icon: FiCreditCard, route: "/Décompte" },
  { key: "kpi", label: "Tableau de bord KPI", icon: FiBarChart2, route: "/GlobalDash" },
  { key: "reports", label: "Rapports PDF", icon: FiFileText, route: "/Rapport" },
  { key: "admin", label: "Administration", icon: FiSettings, route: "/UserManagement", divider: true, adminOnly: true },
  { key: "database", label: "Base de données", icon: FiDatabase, route: "/BaseDeDonnees" },
];

const conductorNavigation = new Set(["dashboard", "journal", "delais", "budget"]);

const firstValue = (project, keys) => {
  for (const key of keys) {
    if (project[key] !== undefined && project[key] !== null && project[key] !== "") {
      return project[key];
    }
  }
  return null;
};

const numberValue = (project, keys, fallback = 0) => {
  const value = firstValue(project, keys);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const dateValue = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = dateValue(value);
  return date
    ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date)
    : "Non renseignée";
};

const projectName = (project) =>
  firstValue(project, ["nom", "name", "nomProjet", "projectName", "titre"]) || "Projet sans nom";

const projectStatus = (project) =>
  String(firstValue(project, ["statut", "status", "etat"]) || "En cours").trim();

const projectProgress = (project) =>
  Math.min(100, Math.max(0, numberValue(project, ["avancement", "progression", "progress", "pourcentage"], 0)));

const isClosedStatus = (status) =>
  ["terminé", "termine", "achevé", "acheve", "clôturé", "cloture", "clos", "annulé", "annule", "completed", "closed"].includes(
    status.toLowerCase()
  );

const countActiveStops = (project) => {
  const stops = firstValue(project, ["arrets", "arrêts", "stoppages", "workStoppages"]);
  if (Array.isArray(stops)) {
    return stops.filter((stop) => {
      const status = String(stop?.statut || stop?.status || "").toLowerCase();
      return !stop?.dateFin && !stop?.endDate && !["terminé", "termine", "clos", "closed"].includes(status);
    }).length;
  }
  return numberValue(project, ["arretsEnCours", "arrêtsEnCours", "activeStops"], 0);
};

const countReports = (project) => {
  const reports = firstValue(project, ["rapports", "reports"]);
  if (Array.isArray(reports)) return reports.length;
  return numberValue(project, ["rapportsGeneres", "rapportsGénérés", "nombreRapports", "reportsCount"], 0);
};

function FirstPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      setLoadingProjects(true);
      setLoadError("");
      try {
        const snapshot = await getDocs(collection(db, "projets"));
        if (active) setProjects(snapshot.docs.map((project) => ({ id: project.id, ...project.data() })));
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
        if (active) setLoadError("Les projets ne peuvent pas être chargés pour le moment.");
      } finally {
        if (active) setLoadingProjects(false);
      }
    };
    loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const activeProjects = projects.filter((project) => !isClosedStatus(projectStatus(project)));
    const progressTotal = projects.reduce((total, project) => total + projectProgress(project), 0);
    const stops = projects.reduce((total, project) => total + countActiveStops(project), 0);
    const reports = projects.reduce((total, project) => total + countReports(project), 0);
    return {
      activeProjects: activeProjects.length,
      averageProgress: projects.length ? Math.round(progressTotal / projects.length) : 0,
      stops,
      reports,
    };
  }, [projects]);

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => {
          const first = dateValue(firstValue(a, ["dateDebut", "dateDemarrage", "startDate", "createdAt"]))?.getTime() || 0;
          const second = dateValue(firstValue(b, ["dateDebut", "dateDemarrage", "startDate", "createdAt"]))?.getTime() || 0;
          return second - first;
        })
        .slice(0, 6),
    [projects]
  );

  const visibleNavigation = navigationItems.filter((item) => {
    if (item.adminOnly) return role === ROLES.ADMIN;
    if (role === ROLES.CONDUCTEUR) return conductorNavigation.has(item.key);
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navigateTo = (route) => {
    setSidebarOpen(false);
    navigate(route);
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-navbar">
        <button className="mobile-menu-button" type="button" aria-label="Ouvrir le menu" onClick={() => setSidebarOpen(true)}>
          <FiMenu />
        </button>
        <img src={AxiaBatLogo} alt="AxiaBat" className="dashboard-logo" />
        <div className="current-role">
          <span>ESPACE DE TRAVAIL</span>
          <strong>{roleLabel}</strong>
        </div>
        <div className="navbar-user">
          <div className="user-avatar">{initials || <FiUser />}</div>
          <div className="navbar-user-copy">
            <strong>{userName}</strong>
            <span>{roleLabel}</span>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout} title="Se déconnecter">
            <FiLogOut />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-mobile-header">
          <span>Navigation</span>
          <button type="button" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        <div className="sidebar-section-label">MENU PRINCIPAL</div>
        <nav aria-label="Navigation principale">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.key}>
                {item.divider && <div className="sidebar-divider" />}
                <button
                  type="button"
                  className={`sidebar-link ${item.key === "dashboard" ? "active" : ""}`}
                  onClick={() => navigateTo(item.route)}
                >
                  <Icon />
                  <span>{item.label}</span>
                  {item.key === "dashboard" && <span className="active-dot" />}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <FiActivity />
          <span>AxiaBat Pro</span>
          <small>Gestion BTP intégrée</small>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">VUE D’ENSEMBLE</p>
            <h1>Tableau de bord</h1>
            <p className="heading-subtitle">Suivez l’activité de vos projets en un coup d’œil.</p>
          </div>
          <button className="primary-action" type="button" onClick={() => navigateTo("/Project3")}>
            <FiPlus />
            Nouveau projet
          </button>
        </div>

        {loadError && (
          <div className="dashboard-alert" role="alert">
            {loadError}
          </div>
        )}

        <section className="stats-grid" aria-label="Indicateurs clés">
          <StatCard label="Projets actifs" value={stats.activeProjects} helper="projets en cours" icon={FiFolder} color="blue" loading={loadingProjects} />
          <StatCard label="Avancement moyen" value={`${stats.averageProgress}%`} helper="sur l’ensemble des projets" icon={FiActivity} color="green" loading={loadingProjects} />
          <StatCard label="Arrêts en cours" value={stats.stops} helper="à traiter" icon={FiClock} color="orange" loading={loadingProjects} />
          <StatCard label="Rapports générés" value={stats.reports} helper="depuis le lancement" icon={FiFileText} color="purple" loading={loadingProjects} />
        </section>

        <div className="dashboard-columns">
          <section className="content-card projects-card">
            <div className="section-heading">
              <div>
                <h2>Projets récents</h2>
                <p>Les dernières opérations ajoutées à votre espace</p>
              </div>
              <button type="button" className="text-button" onClick={() => navigateTo("/Project3")}>
                Voir tous les projets <FiChevronRight />
              </button>
            </div>
            <div className="table-wrap">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Statut</th>
                    <th>Avancement</th>
                    <th>Démarrage</th>
                    <th aria-label="Action" />
                  </tr>
                </thead>
                <tbody>
                  {loadingProjects ? (
                    <tr><td colSpan="5" className="table-message">Chargement des projets...</td></tr>
                  ) : recentProjects.length === 0 ? (
                    <tr><td colSpan="5" className="table-message">Aucun projet enregistré.</td></tr>
                  ) : (
                    recentProjects.map((project) => {
                      const status = projectStatus(project);
                      const progress = projectProgress(project);
                      return (
                        <tr key={project.id}>
                          <td><strong className="project-title">{projectName(project)}</strong><span className="project-id">Réf. {project.id.slice(0, 8)}</span></td>
                          <td><span className={`status-badge ${isClosedStatus(status) ? "complete" : "active"}`}>{status}</span></td>
                          <td>
                            <div className="progress-cell"><span>{progress}%</span><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
                          </td>
                          <td className="date-cell">{formatDate(firstValue(project, ["dateDebut", "dateDemarrage", "startDate", "createdAt"]))}</td>
                          <td><button type="button" className="open-button" onClick={() => navigateTo("/FicheProjet")}>Ouvrir <FiChevronRight /></button></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="content-card quick-actions-card">
            <div className="section-heading">
              <div>
                <h2>Actions rapides</h2>
                <p>Accédez directement à vos outils</p>
              </div>
            </div>
            <div className="quick-actions">
              <QuickAction icon={FiPlus} label="Nouveau projet" route="/Project3" onClick={navigateTo} color="blue" />
              <QuickAction icon={FiBookOpen} label="Saisir journal" route="/JournalChantier" onClick={navigateTo} color="green" />
              <QuickAction icon={FiClock} label="Déclarer un arrêt" route="/Délais" onClick={navigateTo} color="orange" />
              <QuickAction icon={FiFileText} label="Générer un rapport" route="/Rapport" onClick={navigateTo} color="purple" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, helper, icon: Icon, color, loading }) {
  return (
    <article className={`stat-card stat-${color}`}>
      <div className="stat-icon"><Icon /></div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{loading ? "—" : value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function QuickAction({ icon: Icon, label, route, onClick, color }) {
  return (
    <button type="button" className="quick-action" onClick={() => onClick(route)}>
      <span className={`quick-action-icon quick-${color}`}><Icon /></span>
      <span>{label}</span>
      <FiChevronRight className="quick-action-chevron" />
    </button>
  );
}

export default FirstPage;
