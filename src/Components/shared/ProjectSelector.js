import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const C = {
  primary: "#1e3a5f",
  accent: "#f59e0b",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
};

/**
 * ProjectSelector — Composant réutilisable de sélection de projet
 * Props :
 *   - moduleTitle  : string  — titre du module (ex: "Journal de Chantier")
 *   - moduleIcon   : string  — emoji icône (ex: "📓")
 *   - moduleDesc   : string  — description courte
 *   - onSelect     : function(projet) — callback quand un projet est sélectionné
 */
export default function ProjectSelector({ moduleTitle, moduleIcon, moduleDesc, onSelect }) {
  const navigate = useNavigate();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const fetchProjets = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "projets"));
        setProjets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Erreur chargement projets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjets();
  }, []);

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);
    if (id) {
      const projet = projets.find((p) => p.id === id);
      if (projet) onSelect(projet);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Icône + Titre module */}
        <div style={s.header}>
          <div style={s.iconWrapper}>
            <span style={s.icon}>{moduleIcon || "📋"}</span>
          </div>
          <h1 style={s.title}>{moduleTitle}</h1>
          <p style={s.desc}>{moduleDesc || "Sélectionnez un projet pour continuer"}</p>
        </div>

        {/* Roulette */}
        <div style={s.selectorWrapper}>
          <label style={s.label}>Sélectionner le projet :</label>
          {loading ? (
            <div style={s.loading}>
              <div style={s.spinner} />
              <span>Chargement des projets...</span>
            </div>
          ) : projets.length === 0 ? (
            <div style={s.empty}>
              <span style={s.emptyIcon}>📁</span>
              <p style={s.emptyText}>Aucun projet disponible.</p>
              <p style={s.emptyDesc}>Créez d'abord une fiche projet.</p>
              <button style={s.btnPrimary} onClick={() => navigate("/FicheProjet")}>
                + Créer un projet
              </button>
            </div>
          ) : (
            <>
              <select style={s.select} value={selected} onChange={handleChange}>
                <option value="">-- Choisir un projet --</option>
                {projets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numProjet ? `[${p.numProjet}] ` : ""}{p.nomProjet}
                  </option>
                ))}
              </select>

              {/* Cartes projets */}
              <div style={s.divider}>
                <span style={s.dividerText}>ou sélectionnez directement</span>
              </div>

              <div style={s.grid}>
                {projets.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      ...s.projetCard,
                      ...(selected === p.id ? s.projetCardActive : {}),
                    }}
                    onClick={() => {
                      setSelected(p.id);
                      onSelect(p);
                    }}
                  >
                    <div style={s.projetNum}>{p.numProjet || "—"}</div>
                    <div style={s.projetNom}>{p.nomProjet}</div>
                    <div style={s.projetMeta}>
                      {p.lieu && <span>📍 {p.lieu}</span>}
                      {p.delais && <span>⏱ {p.delais} j</span>}
                      {p.budget && <span>💰 {Number(p.budget).toLocaleString("fr-DZ")} DA</span>}
                    </div>
                    <div style={s.projetStatut}>
                      {selected === p.id
                        ? <span style={s.badgeSelected}>✅ Sélectionné</span>
                        : <span style={s.badgeSelect}>Sélectionner →</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Retour accueil */}
        <div style={s.footer}>
          <button style={s.btnSecondary} onClick={() => navigate("/FirstPage")}>
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(145deg, #1e3a5f 0%, #0f2744 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  card: {
    background: C.white,
    borderRadius: 20,
    padding: "40px 48px",
    width: "100%",
    maxWidth: 720,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    textAlign: "center",
    marginBottom: 36,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    background: "#eff6ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: C.primary,
    marginBottom: 8,
    marginTop: 0,
  },
  desc: {
    fontSize: 15,
    color: C.muted,
    marginTop: 0,
  },
  selectorWrapper: { marginBottom: 32 },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    marginBottom: 10,
  },
  select: {
    width: "100%",
    padding: "14px 18px",
    border: `2px solid ${C.primary}`,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    color: C.text,
    background: C.white,
    outline: "none",
    cursor: "pointer",
    marginBottom: 8,
  },
  divider: {
    textAlign: "center",
    margin: "24px 0 20px",
    borderTop: `1px solid ${C.border}`,
    paddingTop: 16,
  },
  dividerText: {
    fontSize: 13,
    color: C.muted,
    background: C.white,
    padding: "0 12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
    marginTop: 8,
  },
  projetCard: {
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
    padding: "16px 18px",
    cursor: "pointer",
    background: C.bg,
    transition: "all 0.2s",
  },
  projetCardActive: {
    border: `2px solid ${C.primary}`,
    background: "#eff6ff",
    boxShadow: `0 0 0 3px rgba(30,58,95,0.1)`,
  },
  projetNum: {
    fontSize: 11,
    color: C.muted,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  projetNom: {
    fontSize: 15,
    fontWeight: 700,
    color: C.text,
    marginBottom: 8,
  },
  projetMeta: {
    display: "flex",
    gap: 10,
    fontSize: 12,
    color: C.muted,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  projetStatut: { marginTop: 4 },
  badgeSelected: {
    fontSize: 12,
    fontWeight: 700,
    color: "#065f46",
    background: "#d1fae5",
    padding: "3px 10px",
    borderRadius: 20,
  },
  badgeSelect: {
    fontSize: 12,
    fontWeight: 600,
    color: C.primary,
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 20,
    color: C.muted,
    fontSize: 14,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${C.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center",
    padding: 40,
  },
  emptyIcon: { fontSize: 48, display: "block", marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: C.muted, marginBottom: 20 },
  btnPrimary: {
    padding: "10px 24px",
    background: C.primary,
    color: C.white,
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    paddingTop: 16,
    borderTop: `1px solid ${C.border}`,
  },
  btnSecondary: {
    padding: "10px 24px",
    background: "transparent",
    color: C.muted,
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
  },
};