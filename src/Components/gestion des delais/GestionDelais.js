import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const C = {
  primary: "#1e3a5f",
  accent: "#f59e0b",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
};

// Calculer durée entre deux dates (jours)
const dureeJours = (d1, d2) => {
  if (!d1 || !d2) return 0;
  return Math.max(0, Math.ceil((new Date(d2) - new Date(d1)) / 86400000));
};

// Ajouter des jours à une date
const addJours = (date, jours) => {
  const d = new Date(date);
  d.setDate(d.getDate() + jours);
  return d.toISOString().split("T")[0];
};

// Formater date en français
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-DZ", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

export default function GestionDelais() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [vue, setVue] = useState("liste"); // "liste" | "suivi" | "dashboard"
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [deadlineData, setDeadlineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Formulaire arrêt
  const [arrets, setArrets] = useState([]);
  const [newArret, setNewArret] = useState({ dateDebut: "", dateFin: "", motif: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Charger projets depuis Firestore
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "projets"));
        setProjets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Sélectionner un projet et charger ses deadlines
  const handleSelectProjet = async (projet) => {
    setSelectedProjet(projet);
    setArrets([]);
    setDeadlineData(null);

    try {
      const snap = await getDoc(doc(db, "deadlines", projet.id));
      if (snap.exists()) {
        const data = snap.data();
        setArrets(data.arrets || []);
        setDeadlineData(data);
      }
    } catch (err) {
      console.error(err);
    }
    setVue("suivi");
  };

  // Calculs dates
  const dateFinContractuelle = selectedProjet
    ? addJours(selectedProjet.dateDemarrage, parseInt(selectedProjet.delais || 0))
    : "";

  const totalJoursArret = arrets.reduce(
    (sum, a) => sum + dureeJours(a.dateDebut, a.dateFin), 0
  );

  const dateFinReelle = selectedProjet
    ? addJours(selectedProjet.dateDemarrage, parseInt(selectedProjet.delais || 0) + totalJoursArret)
    : "";

  const joursRetard = dateFinReelle && dateFinContractuelle
    ? Math.max(0, dureeJours(dateFinContractuelle, dateFinReelle))
    : 0;

  const estEnRetard = dateFinReelle > dateFinContractuelle;

  // Avancement en % basé sur la date actuelle
  const today = new Date().toISOString().split("T")[0];
  const joursEcoules = selectedProjet
    ? Math.min(dureeJours(selectedProjet.dateDemarrage, today), parseInt(selectedProjet.delais || 0) + totalJoursArret)
    : 0;
  const totalJours = parseInt(selectedProjet?.delais || 0) + totalJoursArret;
  const avancement = totalJours > 0 ? Math.min(100, Math.round((joursEcoules / totalJours) * 100)) : 0;

  // Ajouter un arrêt
  const handleAddArret = () => {
    if (!newArret.dateDebut || !newArret.dateFin || !newArret.motif) {
      showToast("Veuillez remplir tous les champs de l'arrêt.", "error");
      return;
    }
    if (new Date(newArret.dateFin) < new Date(newArret.dateDebut)) {
      showToast("La date de fin doit être après la date de début.", "error");
      return;
    }
    const duree = dureeJours(newArret.dateDebut, newArret.dateFin);
    setArrets((prev) => [
      ...prev,
      { ...newArret, dureeJours: duree, createdAt: new Date().toISOString() },
    ]);
    setNewArret({ dateDebut: "", dateFin: "", motif: "" });
    showToast("Arrêt ajouté.");
  };

  const handleDeleteArret = (idx) => {
    setArrets((prev) => prev.filter((_, i) => i !== idx));
    showToast("Arrêt supprimé.");
  };

  // Enregistrer dans Firestore
  const handleSave = async () => {
    if (!selectedProjet) return;
    setSaving(true);
    try {
      const data = {
        projetId: selectedProjet.id,
        projetInfo: {
          nomProjet: selectedProjet.nomProjet || "",
          numProjet: selectedProjet.numProjet || "",
          dateDemarrage: selectedProjet.dateDemarrage || "",
          delaisInitial: parseInt(selectedProjet.delais || 0),
          budget: selectedProjet.budget || 0,
          bank: selectedProjet.bank || "",
        },
        suivis: {
          dateFinContractuelle,
          dateFinReelle,
          totalJoursArret,
          joursRetard,
          estEnRetard,
          avancement,
        },
        arrets,
        savedBy: userProfile?.displayName || currentUser?.email || "",
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "deadlines", selectedProjet.id), data, { merge: true });
      setDeadlineData(data);
      showToast("Suivi des délais enregistré avec succès !");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Données pour graphique
  const chartData = [
    { name: "Délai initial", jours: parseInt(selectedProjet?.delais || 0), fill: C.success },
    { name: "Jours d'arrêt", jours: totalJoursArret, fill: C.warning },
    { name: "Délai réel", jours: parseInt(selectedProjet?.delais || 0) + totalJoursArret, fill: estEnRetard ? C.danger : C.primary },
  ];

  // Données tendance pour LineChart
  const tendanceData = arrets.map((a, i) => ({
    name: `Arrêt ${i + 1}`,
    cumul: arrets.slice(0, i + 1).reduce((s, x) => s + x.dureeJours, 0),
  }));
  if (tendanceData.length > 0) tendanceData.unshift({ name: "Départ", cumul: 0 });

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? C.danger : C.success }}>
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink} onClick={() => navigate("/FirstPage")}>Accueil</span>
            <span style={s.breadcrumbSep}>/</span>
            {vue !== "liste" && (
              <>
                <span style={s.breadcrumbLink} onClick={() => setVue("liste")}>Projets</span>
                <span style={s.breadcrumbSep}>/</span>
              </>
            )}
            <span>{vue === "dashboard" ? "Tableau de bord" : vue === "suivi" ? selectedProjet?.nomProjet : "Gestion des Délais"}</span>
          </div>
          <h1 style={s.title}>⏱️ Gestion des Délais</h1>
          <p style={s.subtitle}>{userProfile?.displayName || currentUser?.email}</p>
        </div>
        <div style={s.headerActions}>
          {vue === "liste" && (
            <button style={s.btnOutline} onClick={() => setVue("dashboard")}>
              📊 Tableau de bord global
            </button>
          )}
          {vue === "suivi" && (
            <>
              <button style={s.btnSecondary} onClick={() => setVue("liste")}>← Retour</button>
              <button style={s.btnOutline} onClick={() => setVue("dashboard")}>📊 Dashboard</button>
              <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? "Enregistrement..." : "💾 Enregistrer"}
              </button>
            </>
          )}
          {vue === "dashboard" && (
            <button style={s.btnSecondary} onClick={() => setVue("liste")}>← Retour</button>
          )}
        </div>
      </div>

      {/* VUE LISTE PROJETS */}
      {vue === "liste" && (
        <div style={s.content}>
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Sélectionnez un projet à suivre</h2>
            {loading ? (
              <p style={{ color: C.muted }}>Chargement des projets...</p>
            ) : projets.length === 0 ? (
              <div style={s.emptyState}>
                <span style={s.emptyIcon}>📁</span>
                <p>Aucun projet disponible. Créez d'abord une fiche projet.</p>
                <button style={s.btnPrimary} onClick={() => navigate("/FicheProjet")}>
                  Créer un projet
                </button>
              </div>
            ) : (
              <div style={s.tableWrapper}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      <th style={s.th}>N° Projet</th>
                      <th style={s.th}>Nom du Projet</th>
                      <th style={s.th}>Démarrage</th>
                      <th style={s.th}>Délai initial</th>
                      <th style={s.th}>Fin contractuelle</th>
                      <th style={s.th}>Statut</th>
                      <th style={s.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projets.map((p) => {
                      const fin = addJours(p.dateDemarrage, parseInt(p.delais || 0));
                      const enRetard = today > fin;
                      return (
                        <tr key={p.id} style={s.tr}>
                          <td style={s.td}>{p.numProjet || "—"}</td>
                          <td style={{ ...s.td, fontWeight: 600 }}>{p.nomProjet}</td>
                          <td style={s.td}>{formatDate(p.dateDemarrage)}</td>
                          <td style={s.td}>{p.delais} jours</td>
                          <td style={s.td}>{formatDate(fin)}</td>
                          <td style={s.td}>
                            <span style={{ ...s.badge, ...(enRetard ? s.badgeDanger : s.badgeSuccess) }}>
                              {enRetard ? "⚠️ En retard" : "✅ En cours"}
                            </span>
                          </td>
                          <td style={s.td}>
                            <button style={s.btnSmPrimary} onClick={() => handleSelectProjet(p)}>
                              Suivre →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VUE SUIVI PROJET */}
      {vue === "suivi" && selectedProjet && (
        <div style={s.content}>

          {/* KPIs */}
          <div style={s.kpiGrid}>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Délai initial</div>
              <div style={{ ...s.kpiValue, color: C.primary }}>{selectedProjet.delais} jours</div>
              <div style={s.kpiSub}>{formatDate(selectedProjet.dateDemarrage)} → {formatDate(dateFinContractuelle)}</div>
            </div>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Jours d'arrêt</div>
              <div style={{ ...s.kpiValue, color: C.warning }}>{totalJoursArret} jours</div>
              <div style={s.kpiSub}>{arrets.length} arrêt(s) enregistré(s)</div>
            </div>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Délai réel</div>
              <div style={{ ...s.kpiValue, color: estEnRetard ? C.danger : C.success }}>
                {parseInt(selectedProjet.delais || 0) + totalJoursArret} jours
              </div>
              <div style={s.kpiSub}>Fin réelle : {formatDate(dateFinReelle)}</div>
            </div>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Retard</div>
              <div style={{ ...s.kpiValue, color: estEnRetard ? C.danger : C.success }}>
                {estEnRetard ? `+${joursRetard} jours` : "0 jour"}
              </div>
              <div style={s.kpiSub}>
                {estEnRetard ? "⚠️ Dépassement constaté" : "✅ Dans les délais"}
              </div>
            </div>
          </div>

          {/* Barre d'avancement */}
          <div style={s.card}>
            <div style={s.progressHeader}>
              <span style={s.sectionTitle}>📈 Avancement du projet</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{avancement}%</span>
            </div>
            <div style={s.progressBg}>
              <div style={{
                ...s.progressBar,
                width: `${avancement}%`,
                background: estEnRetard ? C.danger : avancement >= 80 ? C.warning : C.success,
              }} />
            </div>
            <div style={s.progressLabels}>
              <span>Démarrage : {formatDate(selectedProjet.dateDemarrage)}</span>
              <span>Aujourd'hui : {formatDate(today)}</span>
              <span>Fin réelle : {formatDate(dateFinReelle)}</span>
            </div>
          </div>

          {/* Graphique */}
          <div style={{ ...s.card, marginTop: 20 }}>
            <h2 style={s.sectionTitle}>📊 Comparaison des délais</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit=" j" />
                <Tooltip formatter={(v) => `${v} jours`} />
                <Bar dataKey="jours" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Arrêts de travaux */}
          <div style={{ ...s.card, marginTop: 20 }}>
            <h2 style={s.sectionTitle}>🛑 Arrêts de travaux</h2>

            {/* Formulaire ajout arrêt */}
            <div style={s.arretForm}>
              <h3 style={s.subTitle}>Ajouter un arrêt</h3>
              <div style={s.grid3}>
                <div style={s.field}>
                  <label style={s.label}>Date début *</label>
                  <input type="date" style={s.input}
                    value={newArret.dateDebut}
                    onChange={(e) => setNewArret({ ...newArret, dateDebut: e.target.value })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Date fin *</label>
                  <input type="date" style={s.input}
                    value={newArret.dateFin}
                    onChange={(e) => setNewArret({ ...newArret, dateFin: e.target.value })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Motif *</label>
                  <input type="text" style={s.input} placeholder="Intempéries, grève, force majeure..."
                    value={newArret.motif}
                    onChange={(e) => setNewArret({ ...newArret, motif: e.target.value })} />
                </div>
              </div>
              {newArret.dateDebut && newArret.dateFin && (
                <div style={s.dureeBadge}>
                  Durée : <strong>{dureeJours(newArret.dateDebut, newArret.dateFin)} jours</strong>
                </div>
              )}
              <button style={s.btnAdd} onClick={handleAddArret}>+ Ajouter cet arrêt</button>
            </div>

            {/* Liste des arrêts */}
            {arrets.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={s.tableWrapper}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>N°</th>
                        <th style={s.th}>Date début</th>
                        <th style={s.th}>Date fin</th>
                        <th style={s.th}>Durée</th>
                        <th style={s.th}>Motif</th>
                        <th style={s.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrets.map((a, i) => (
                        <tr key={i} style={s.tr}>
                          <td style={s.td}>{i + 1}</td>
                          <td style={s.td}>{formatDate(a.dateDebut)}</td>
                          <td style={s.td}>{formatDate(a.dateFin)}</td>
                          <td style={{ ...s.td, fontWeight: 700, color: C.warning }}>
                            {a.dureeJours} jours
                          </td>
                          <td style={s.td}>{a.motif}</td>
                          <td style={s.td}>
                            <button style={s.deleteBtn} onClick={() => handleDeleteArret(i)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={s.totalRow}>
                  Total jours d'arrêt : <strong style={{ color: C.warning }}>{totalJoursArret} jours</strong>
                </div>
              </div>
            )}
          </div>

          {/* Synthèse */}
          <div style={{ ...s.card, marginTop: 20 }}>
            <h2 style={s.sectionTitle}>📋 Synthèse contractuelle</h2>
            <div style={s.synthGrid}>
              {[
                { label: "Projet", value: selectedProjet.nomProjet },
                { label: "N° Projet", value: selectedProjet.numProjet || "—" },
                { label: "Date de démarrage", value: formatDate(selectedProjet.dateDemarrage) },
                { label: "Délai contractuel", value: `${selectedProjet.delais} jours` },
                { label: "Date fin contractuelle", value: formatDate(dateFinContractuelle) },
                { label: "Total jours d'arrêt", value: `${totalJoursArret} jours` },
                { label: "Date fin réelle", value: formatDate(dateFinReelle), highlight: estEnRetard ? C.danger : C.success },
                { label: "Retard constaté", value: estEnRetard ? `${joursRetard} jours` : "Aucun", highlight: estEnRetard ? C.danger : C.success },
              ].map((item) => (
                <div key={item.label} style={s.synthCard}>
                  <div style={s.synthLabel}>{item.label}</div>
                  <div style={{ ...s.synthValue, color: item.highlight || C.text }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.formFooter}>
            <button style={s.btnSecondary} onClick={() => setVue("liste")}>← Retour</button>
            <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "💾 Enregistrer le suivi"}
            </button>
          </div>
        </div>
      )}

      {/* VUE DASHBOARD GLOBAL */}
      {vue === "dashboard" && (
        <div style={s.content}>
          <div style={s.kpiGrid}>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Total projets</div>
              <div style={{ ...s.kpiValue, color: C.primary }}>{projets.length}</div>
            </div>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>En retard</div>
              <div style={{ ...s.kpiValue, color: C.danger }}>
                {projets.filter((p) => today > addJours(p.dateDemarrage, parseInt(p.delais || 0))).length}
              </div>
            </div>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Dans les délais</div>
              <div style={{ ...s.kpiValue, color: C.success }}>
                {projets.filter((p) => today <= addJours(p.dateDemarrage, parseInt(p.delais || 0))).length}
              </div>
            </div>
            <div style={s.kpiCard}>
              <div style={s.kpiLabel}>Délai moyen</div>
              <div style={{ ...s.kpiValue, color: C.accent }}>
                {projets.length > 0
                  ? Math.round(projets.reduce((s, p) => s + parseInt(p.delais || 0), 0) / projets.length)
                  : 0} j
              </div>
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.sectionTitle}>📊 Délais par projet</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={projets.map((p) => ({
                  name: p.nomProjet?.substring(0, 15) + "...",
                  Prévu: parseInt(p.delais || 0),
                  Écoulé: Math.min(dureeJours(p.dateDemarrage, today), parseInt(p.delais || 0)),
                }))}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} unit=" j" />
                <Tooltip formatter={(v) => `${v} jours`} />
                <Legend />
                <Bar dataKey="Prévu" fill={C.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Écoulé" fill={C.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...s.card, marginTop: 20 }}>
            <h2 style={s.sectionTitle}>📋 Récapitulatif de tous les projets</h2>
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Projet</th>
                    <th style={s.th}>Démarrage</th>
                    <th style={s.th}>Fin contractuelle</th>
                    <th style={s.th}>Délai (j)</th>
                    <th style={s.th}>Statut</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projets.map((p) => {
                    const fin = addJours(p.dateDemarrage, parseInt(p.delais || 0));
                    const enRetard = today > fin;
                    return (
                      <tr key={p.id} style={s.tr}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{p.nomProjet}</td>
                        <td style={s.td}>{formatDate(p.dateDemarrage)}</td>
                        <td style={s.td}>{formatDate(fin)}</td>
                        <td style={s.td}>{p.delais}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(enRetard ? s.badgeDanger : s.badgeSuccess) }}>
                            {enRetard ? "⚠️ En retard" : "✅ OK"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <button style={s.btnSmPrimary} onClick={() => handleSelectProjet(p)}>
                            Détails →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  breadcrumb: { fontSize: 13, color: C.muted, marginBottom: 6 },
  breadcrumbLink: { color: C.primary, cursor: "pointer", fontWeight: 600 },
  breadcrumbSep: { margin: "0 8px" },
  title: { fontSize: 22, fontWeight: 700, color: C.text, margin: 0 },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 4 },
  headerActions: { display: "flex", gap: 12 },
  btnPrimary: { padding: "10px 20px", background: C.primary, color: C.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { padding: "10px 20px", background: C.white, color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "10px 20px", background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnAdd: { padding: "9px 18px", background: C.success, color: C.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 12 },
  btnSmPrimary: { padding: "6px 14px", background: C.primary, color: C.white, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  content: { padding: 32, maxWidth: 1200, margin: "0 auto" },
  card: { background: C.white, borderRadius: 12, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: `1px solid ${C.border}` },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20, marginTop: 0, display: "block" },
  subTitle: { fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16, marginTop: 0 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  kpiCard: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  kpiLabel: { fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 },
  kpiValue: { fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 6 },
  kpiSub: { fontSize: 11, color: C.muted },
  progressHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  progressBg: { background: C.bg, borderRadius: 20, height: 18, overflow: "hidden", border: `1px solid ${C.border}` },
  progressBar: { height: "100%", borderRadius: 20, transition: "width 0.4s ease" },
  progressLabels: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 8 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  field: { marginBottom: 4 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: C.white },
  arretForm: { background: C.bg, borderRadius: 10, padding: 20, border: `1px solid ${C.border}`, marginBottom: 8 },
  dureeBadge: { fontSize: 13, color: C.warning, fontWeight: 600, marginTop: 8 },
  tableWrapper: { overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: C.bg },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` },
  tr: { borderBottom: `1px solid ${C.border}` },
  td: { padding: "12px 14px", fontSize: 14, color: C.text, verticalAlign: "middle" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.danger, padding: 4 },
  totalRow: { textAlign: "right", fontSize: 13, color: C.muted, marginTop: 10 },
  formFooter: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 },
  badge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeSuccess: { background: "#d1fae5", color: "#065f46" },
  badgeDanger: { background: "#fef2f2", color: "#991b1b" },
  emptyState: { textAlign: "center", padding: 60 },
  emptyIcon: { fontSize: 48, display: "block", marginBottom: 16 },
  synthGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  synthCard: { background: C.bg, borderRadius: 10, padding: "14px 18px", border: `1px solid ${C.border}` },
  synthLabel: { fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 },
  synthValue: { fontSize: 15, fontWeight: 700, color: C.text },
  toast: { position: "fixed", bottom: 24, right: 24, color: C.white, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
};