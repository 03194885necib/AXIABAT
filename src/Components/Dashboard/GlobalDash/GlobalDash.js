import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection, getDocs, query, where,
} from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import ProjectSelector from "../../shared/ProjectSelector";

const C = {
  primary: "#1e3a5f", accent: "#f59e0b", success: "#10b981",
  danger: "#ef4444", warning: "#f59e0b", text: "#1e293b",
  muted: "#64748b", border: "#e2e8f0", bg: "#f8fafc", white: "#ffffff",
};

const COLORS = ["#1e3a5f", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" });
};

const addJours = (date, jours) => {
  const d = new Date(date);
  d.setDate(d.getDate() + jours);
  return d.toISOString().split("T")[0];
};

export default function TableauDeBord() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [projetSelectionne, setProjetSelectionne] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Charger données du projet sélectionné
  const loadProjectData = async (projet) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Charger journaux de chantier
      const journauxSnap = await getDocs(
        query(collection(db, "journauxDeChantier"), where("projetId", "==", projet.id))
      );
      const journaux = journauxSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Charger articles du projet
      const articlesSnap = await getDocs(
        collection(db, "projets", projet.id, "ArticlesProjet")
      );
      const articles = articlesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Charger deadlines
      const deadlineSnap = await getDocs(
        query(collection(db, "deadlines"), where("projetId", "==", projet.id))
      );
      const deadline = deadlineSnap.docs[0]?.data() || null;

      // Calculs délais
      const dateFinContractuelle = addJours(projet.dateDemarrage, parseInt(projet.delais || 0));
      const joursEcoules = Math.max(0, Math.ceil((new Date(today) - new Date(projet.dateDemarrage)) / 86400000));
      const avancement = Math.min(100, Math.round((joursEcoules / parseInt(projet.delais || 1)) * 100));
      const estEnRetard = today > dateFinContractuelle;
      const joursRestants = Math.max(0, Math.ceil((new Date(dateFinContractuelle) - new Date(today)) / 86400000));

      // Calculs financiers
      const totalHT = articles.reduce((s, a) => s + (a.montantHT || 0), 0);
      const tvaAmount = totalHT * (parseFloat(projet.tva || 19) / 100);
      const totalTTC = totalHT + tvaAmount;
      const budget = parseFloat(projet.budget || 0);
      const ecartBudget = budget - totalTTC;

      // Données graphique personnel par jour
      const personnelData = journaux.slice(-7).map((j) => ({
        date: j.date ? new Date(j.date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" }) : "—",
        personnel: j.personnel?.reduce((s, p) => s + parseInt(p.nombre || 0), 0) || 0,
      }));

      // Données matériel par état
      const materielStats = { marche: 0, immobilise: 0, panne: 0 };
      journaux.forEach((j) => {
        j.materiel?.forEach((m) => {
          materielStats[m.etat] = (materielStats[m.etat] || 0) + 1;
        });
      });

      const materielData = [
        { name: "En marche", value: materielStats.marche, color: C.success },
        { name: "Immobilisé", value: materielStats.immobilise, color: C.warning },
        { name: "En panne", value: materielStats.panne, color: C.danger },
      ].filter((m) => m.value > 0);

      // Données articles par catégorie (montant)
      const articlesData = articles.slice(0, 6).map((a) => ({
        name: a.designation?.substring(0, 20) + "..." || "—",
        montant: a.montantHT || 0,
      }));

      setData({
        projet,
        journaux,
        articles,
        deadline,
        kpis: {
          avancement,
          estEnRetard,
          joursRestants,
          dateFinContractuelle,
          totalHT,
          totalTTC,
          budget,
          ecartBudget,
          nbJournaux: journaux.length,
          totalArrets: deadline?.suivis?.totalJoursArret || 0,
        },
        charts: { personnelData, materielData, articlesData },
      });
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du chargement des données.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProjet = (projet) => {
    setProjetSelectionne(projet);
    loadProjectData(projet);
  };

  // Afficher roulette si pas de projet sélectionné
  if (!projetSelectionne) {
    return (
      <ProjectSelector
        moduleTitle="Tableau de Bord"
        moduleIcon="📊"
        moduleDesc="Sélectionnez le projet pour visualiser ses indicateurs de performance"
        onSelect={handleSelectProjet}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTop: "4px solid #1e3a5f", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: C.muted }}>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
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
            <span>Tableau de Bord</span>
          </div>
          <h1 style={s.title}>📊 Tableau de Bord</h1>
          <p style={s.subtitle}>{data?.projet?.nomProjet} — {userProfile?.displayName || currentUser?.email}</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.btnSecondary} onClick={() => setProjetSelectionne(null)}>
            ← Changer de projet
          </button>
          <button style={s.btnSecondary} onClick={() => navigate("/FirstPage")}>
            🏠 Accueil
          </button>
        </div>
      </div>

      <div style={s.content}>

        {/* Bannière projet */}
        <div style={s.projetBanner}>
          <div style={s.projetBannerLeft}>
            <span style={s.projetBannerIcon}>📋</span>
            <div>
              <div style={s.projetBannerNom}>{data?.projet?.nomProjet}</div>
              <div style={s.projetBannerMeta}>
                {data?.projet?.numProjet && <span>N° {data?.projet?.numProjet}</span>}
                {data?.projet?.lieu && <span> • 📍 {data?.projet?.lieu}</span>}
                {data?.projet?.maireOuvrage && <span> • 🏛️ {data?.projet?.maireOuvrage}</span>}
              </div>
            </div>
          </div>
          <div style={s.projetBannerRight}>
            <span style={{
              ...s.statutBadge,
              background: data?.kpis?.estEnRetard ? "#fef2f2" : "#d1fae5",
              color: data?.kpis?.estEnRetard ? C.danger : "#065f46",
            }}>
              {data?.kpis?.estEnRetard ? "⚠️ En retard" : "✅ Dans les délais"}
            </span>
          </div>
        </div>

        {/* KPIs principaux */}
        <div style={s.kpiGrid}>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>📈</div>
            <div style={s.kpiLabel}>Avancement</div>
            <div style={{ ...s.kpiValue, color: C.primary }}>{data?.kpis?.avancement}%</div>
            <div style={s.progressBg}>
              <div style={{
                ...s.progressBar,
                width: `${data?.kpis?.avancement}%`,
                background: data?.kpis?.estEnRetard ? C.danger : C.success,
              }} />
            </div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>⏱️</div>
            <div style={s.kpiLabel}>Jours restants</div>
            <div style={{ ...s.kpiValue, color: data?.kpis?.estEnRetard ? C.danger : C.success }}>
              {data?.kpis?.joursRestants} j
            </div>
            <div style={s.kpiSub}>Fin : {formatDate(data?.kpis?.dateFinContractuelle)}</div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>💰</div>
            <div style={s.kpiLabel}>Budget</div>
            <div style={{ ...s.kpiValue, color: C.primary }}>
              {data?.kpis?.budget ? `${(data.kpis.budget / 1000000).toFixed(1)} M DA` : "—"}
            </div>
            <div style={s.kpiSub}>
              TTC : {data?.kpis?.totalTTC ? `${(data.kpis.totalTTC / 1000000).toFixed(1)} M DA` : "—"}
            </div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>📓</div>
            <div style={s.kpiLabel}>Journaux</div>
            <div style={{ ...s.kpiValue, color: C.accent }}>{data?.kpis?.nbJournaux}</div>
            <div style={s.kpiSub}>Jours d'arrêt : {data?.kpis?.totalArrets} j</div>
          </div>
        </div>

        {/* Graphiques */}
        <div style={s.chartsGrid}>

          {/* Personnel par jour */}
          <div style={s.chartCard}>
            <h3 style={s.chartTitle}>👷 Personnel — 7 derniers jours</h3>
            {data?.charts?.personnelData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.charts.personnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="personnel" fill={C.primary} radius={[4, 4, 0, 0]} name="Personnel" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={s.noData}>Aucun journal de chantier enregistré</div>
            )}
          </div>

          {/* Matériel par état */}
          <div style={s.chartCard}>
            <h3 style={s.chartTitle}>🔧 État du matériel</h3>
            {data?.charts?.materielData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.charts.materielData}
                    cx="50%" cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.charts.materielData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={s.noData}>Aucune donnée matériel disponible</div>
            )}
          </div>
        </div>

        {/* Articles / Bordereau des prix */}
        {data?.charts?.articlesData?.length > 0 && (
          <div style={s.chartCard}>
            <h3 style={s.chartTitle}>📦 Bordereau des prix — Montants HT</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.charts.articlesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                <Tooltip formatter={(v) => `${v.toLocaleString("fr-DZ")} DA`} />
                <Bar dataKey="montant" fill={C.accent} radius={[0, 4, 4, 0]} name="Montant HT" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Synthèse financière */}
        <div style={s.synthCard}>
          <h3 style={s.chartTitle}>💰 Synthèse financière</h3>
          <div style={s.synthGrid}>
            {[
              { label: "Budget approuvé", value: `${(data?.kpis?.budget || 0).toLocaleString("fr-DZ")} DA`, color: C.primary },
              { label: "Total HT articles", value: `${(data?.kpis?.totalHT || 0).toLocaleString("fr-DZ")} DA`, color: C.text },
              { label: "TVA", value: `${data?.projet?.tva || 19}%`, color: C.muted },
              { label: "Total TTC", value: `${(data?.kpis?.totalTTC || 0).toLocaleString("fr-DZ")} DA`, color: C.accent },
              {
                label: "Écart budget",
                value: `${(data?.kpis?.ecartBudget || 0).toLocaleString("fr-DZ")} DA`,
                color: (data?.kpis?.ecartBudget || 0) >= 0 ? C.success : C.danger,
              },
              { label: "Nombre d'articles", value: `${data?.articles?.length || 0} articles`, color: C.primary },
            ].map((item) => (
              <div key={item.label} style={s.synthItem}>
                <div style={s.synthLabel}>{item.label}</div>
                <div style={{ ...s.synthValue, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
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
  btnSecondary: { padding: "10px 20px", background: C.white, color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  content: { padding: 32, maxWidth: 1200, margin: "0 auto" },
  projetBanner: { background: C.primary, borderRadius: 12, padding: "16px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" },
  projetBannerLeft: { display: "flex", alignItems: "center", gap: 14 },
  projetBannerIcon: { fontSize: 28 },
  projetBannerNom: { fontSize: 16, fontWeight: 700, color: C.white },
  projetBannerMeta: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  projetBannerRight: {},
  statutBadge: { padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  kpiCard: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  kpiIcon: { fontSize: 24, marginBottom: 8 },
  kpiLabel: { fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 },
  kpiValue: { fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 8 },
  kpiSub: { fontSize: 11, color: C.muted },
  progressBg: { background: C.bg, borderRadius: 20, height: 8, overflow: "hidden", border: `1px solid ${C.border}`, marginTop: 8 },
  progressBar: { height: "100%", borderRadius: 20, transition: "width 0.4s ease" },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  chartCard: { background: C.white, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0 },
  noData: { textAlign: "center", padding: 40, color: C.muted, fontSize: 14 },
  synthCard: { background: C.white, borderRadius: 12, padding: 24, border: `1px solid ${C.border}` },
  synthGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  synthItem: { background: C.bg, borderRadius: 10, padding: "14px 18px", border: `1px solid ${C.border}` },
  synthLabel: { fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 },
  synthValue: { fontSize: 16, fontWeight: 700 },
  toast: { position: "fixed", bottom: 24, right: 24, color: C.white, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
};
