import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const C = {
  primary: "#1e3a5f", accent: "#f59e0b", success: "#10b981",
  danger: "#ef4444", text: "#1e293b", muted: "#64748b",
  border: "#e2e8f0", bg: "#f8fafc", white: "#ffffff",
};

const UNITES = ["m", "m²", "m³", "ml", "kg", "T", "U", "Fft", "Ens", "L", "h"];

export default function BaseArticles() {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

  const [vue, setVue] = useState("liste"); // "liste" | "nouveau" | "modifier"
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [articleEdit, setArticleEdit] = useState(null);

  const [formArticle, setFormArticle] = useState({
    numero: "", designation: "", unite: "m", prixUnitaire: "",
    categorie: "", description: "",
  });

  const [formCategorie, setFormCategorie] = useState({ designation: "" });
  const [showCatForm, setShowCatForm] = useState(false);
  const [activeTab, setActiveTab] = useState("articles"); // "articles" | "categories"

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Charger catégories et articles
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catSnap, artSnap] = await Promise.all([
        getDocs(query(collection(db, "categories"), orderBy("designation"))),
        getDocs(query(collection(db, "articles"), orderBy("numero"))),
      ]);
      setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setArticles(artSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtrer articles
  const articlesFiltres = articles.filter((a) => {
    const matchSearch =
      a.designation?.toLowerCase().includes(search.toLowerCase()) ||
      a.numero?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || a.categorie === filterCat;
    return matchSearch && matchCat;
  });

  // Sauvegarder article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!formArticle.designation.trim()) {
      showToast("La désignation est requise.", "error"); return;
    }
    if (!formArticle.categorie) {
      showToast("Veuillez sélectionner une catégorie.", "error"); return;
    }
    setSaving(true);
    try {
      const data = {
        ...formArticle,
        prixUnitaire: parseFloat(formArticle.prixUnitaire || 0),
        updatedAt: serverTimestamp(),
      };
      if (articleEdit) {
        await updateDoc(doc(db, "articles", articleEdit.id), data);
        showToast("Article modifié avec succès.");
      } else {
        await addDoc(collection(db, "articles"), {
          ...data,
          createdBy: currentUser?.uid || "",
          createdAt: serverTimestamp(),
        });
        showToast("Article ajouté avec succès.");
      }
      await fetchData();
      setVue("liste");
      setArticleEdit(null);
      setFormArticle({ numero: "", designation: "", unite: "m", prixUnitaire: "", categorie: "", description: "" });
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer article
  const handleDeleteArticle = async (id, nom) => {
    if (!window.confirm(`Supprimer l'article "${nom}" ?`)) return;
    try {
      await deleteDoc(doc(db, "articles", id));
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast("Article supprimé.");
    } catch (err) {
      showToast("Erreur lors de la suppression.", "error");
    }
  };

  // Modifier article
  const handleEditArticle = (article) => {
    setArticleEdit(article);
    setFormArticle({
      numero: article.numero || "",
      designation: article.designation || "",
      unite: article.unite || "m",
      prixUnitaire: article.prixUnitaire || "",
      categorie: article.categorie || "",
      description: article.description || "",
    });
    setVue("modifier");
  };

  // Sauvegarder catégorie
  const handleSaveCategorie = async (e) => {
    e.preventDefault();
    if (!formCategorie.designation.trim()) {
      showToast("La désignation est requise.", "error"); return;
    }
    try {
      await addDoc(collection(db, "categories"), {
        designation: formCategorie.designation,
        createdAt: serverTimestamp(),
      });
      showToast("Catégorie créée avec succès.");
      setFormCategorie({ designation: "" });
      setShowCatForm(false);
      await fetchData();
    } catch (err) {
      showToast("Erreur lors de la création.", "error");
    }
  };

  // Supprimer catégorie
  const handleDeleteCategorie = async (id, nom) => {
    const articlesLies = articles.filter((a) => a.categorie === id);
    if (articlesLies.length > 0) {
      showToast(`Impossible — ${articlesLies.length} article(s) liés à cette catégorie.`, "error");
      return;
    }
    if (!window.confirm(`Supprimer la catégorie "${nom}" ?`)) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Catégorie supprimée.");
    } catch (err) {
      showToast("Erreur lors de la suppression.", "error");
    }
  };

  const getCatNom = (id) => categories.find((c) => c.id === id)?.designation || "—";

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
            <span>Base de Données Articles</span>
          </div>
          <h1 style={s.title}>🗂️ Base de Données Articles</h1>
          <p style={s.subtitle}>
            {articles.length} article(s) · {categories.length} catégorie(s) —{" "}
            {userProfile?.displayName || currentUser?.email}
          </p>
        </div>
        <div style={s.headerActions}>
          <button style={s.btnSecondary} onClick={() => navigate("/FirstPage")}>← Accueil</button>
          {vue === "liste" && activeTab === "articles" && (
            <button style={s.btnPrimary} onClick={() => {
              setArticleEdit(null);
              setFormArticle({ numero: "", designation: "", unite: "m", prixUnitaire: "", categorie: "", description: "" });
              setVue("nouveau");
            }}>
              + Nouvel article
            </button>
          )}
          {vue === "liste" && activeTab === "categories" && (
            <button style={s.btnPrimary} onClick={() => setShowCatForm(true)}>
              + Nouvelle catégorie
            </button>
          )}
          {(vue === "nouveau" || vue === "modifier") && (
            <button style={s.btnSecondary} onClick={() => { setVue("liste"); setArticleEdit(null); }}>
              ← Retour
            </button>
          )}
        </div>
      </div>

      {/* VUE LISTE */}
      {vue === "liste" && (
        <div style={s.content}>

          {/* Statistiques */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: C.primary }}>{articles.length}</div>
              <div style={s.statLabel}>Total Articles</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: C.accent }}>{categories.length}</div>
              <div style={s.statLabel}>Catégories</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: C.success }}>
                {articles.filter((a) => a.prixUnitaire > 0).length}
              </div>
              <div style={s.statLabel}>Avec prix</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: C.muted }}>
                {articles.filter((a) => !a.prixUnitaire).length}
              </div>
              <div style={s.statLabel}>Sans prix</div>
            </div>
          </div>

          {/* Onglets */}
          <div style={s.tabs}>
            <button
              style={{ ...s.tab, ...(activeTab === "articles" ? s.tabActive : {}) }}
              onClick={() => setActiveTab("articles")}
            >
              📦 Articles ({articles.length})
            </button>
            <button
              style={{ ...s.tab, ...(activeTab === "categories" ? s.tabActive : {}) }}
              onClick={() => setActiveTab("categories")}
            >
              🗂️ Catégories ({categories.length})
            </button>
          </div>

          {/* ONGLET ARTICLES */}
          {activeTab === "articles" && (
            <div style={s.card}>
              {/* Filtres */}
              <div style={s.filters}>
                <input
                  type="text"
                  style={s.searchInput}
                  placeholder="Rechercher un article..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  style={s.select}
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.designation}</option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div style={s.center}>Chargement...</div>
              ) : articlesFiltres.length === 0 ? (
                <div style={s.emptyState}>
                  <span style={s.emptyIcon}>📦</span>
                  <p style={s.emptyTitle}>Aucun article trouvé</p>
                  <p style={s.emptyText}>
                    {articles.length === 0
                      ? "Commencez par créer des catégories puis ajoutez vos articles."
                      : "Modifiez votre recherche ou filtre."}
                  </p>
                  {articles.length === 0 && (
                    <button style={s.btnPrimary} onClick={() => setActiveTab("categories")}>
                      Créer une catégorie d'abord
                    </button>
                  )}
                </div>
              ) : (
                <div style={s.tableWrapper}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>N°</th>
                        <th style={s.th}>Désignation</th>
                        <th style={s.th}>Catégorie</th>
                        <th style={s.th}>Unité</th>
                        <th style={s.th}>Prix Unitaire (DA)</th>
                        <th style={s.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articlesFiltres.map((article) => (
                        <tr key={article.id} style={s.tr}>
                          <td style={s.td}>
                            <span style={s.numBadge}>{article.numero || "—"}</span>
                          </td>
                          <td style={{ ...s.td, fontWeight: 600 }}>
                            {article.designation}
                            {article.description && (
                              <div style={s.articleDesc}>{article.description}</div>
                            )}
                          </td>
                          <td style={s.td}>
                            <span style={s.catBadge}>{getCatNom(article.categorie)}</span>
                          </td>
                          <td style={s.td}>{article.unite}</td>
                          <td style={{ ...s.td, fontWeight: 700, color: C.primary }}>
                            {article.prixUnitaire
                              ? `${Number(article.prixUnitaire).toLocaleString("fr-DZ")} DA`
                              : <span style={{ color: C.muted }}>Non défini</span>
                            }
                          </td>
                          <td style={s.td}>
                            <div style={s.actions}>
                              <button
                                style={{ ...s.actionBtn, color: C.primary }}
                                onClick={() => handleEditArticle(article)}
                                title="Modifier"
                              >✏️</button>
                              <button
                                style={{ ...s.actionBtn, color: C.danger }}
                                onClick={() => handleDeleteArticle(article.id, article.designation)}
                                title="Supprimer"
                              >🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ONGLET CATEGORIES */}
          {activeTab === "categories" && (
            <div style={s.card}>
              {/* Formulaire nouvelle catégorie */}
              {showCatForm && (
                <div style={s.catForm}>
                  <h3 style={s.catFormTitle}>Nouvelle catégorie</h3>
                  <form onSubmit={handleSaveCategorie} noValidate>
                    <div style={s.catFormRow}>
                      <input
                        type="text"
                        style={{ ...s.input, flex: 1 }}
                        placeholder="Désignation de la catégorie..."
                        value={formCategorie.designation}
                        onChange={(e) => setFormCategorie({ designation: e.target.value })}
                        autoFocus
                      />
                      <button type="submit" style={s.btnPrimary}>Créer</button>
                      <button type="button" style={s.btnSecondary} onClick={() => setShowCatForm(false)}>Annuler</button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div style={s.center}>Chargement...</div>
              ) : categories.length === 0 ? (
                <div style={s.emptyState}>
                  <span style={s.emptyIcon}>🗂️</span>
                  <p style={s.emptyTitle}>Aucune catégorie</p>
                  <p style={s.emptyText}>Créez d'abord des catégories pour organiser vos articles.</p>
                  <button style={s.btnPrimary} onClick={() => setShowCatForm(true)}>
                    + Créer une catégorie
                  </button>
                </div>
              ) : (
                <div style={s.catGrid}>
                  {categories.map((cat) => {
                    const nbArticles = articles.filter((a) => a.categorie === cat.id).length;
                    return (
                      <div key={cat.id} style={s.catCard}>
                        <div style={s.catIcon}>🗂️</div>
                        <div style={s.catNom}>{cat.designation}</div>
                        <div style={s.catCount}>
                          <span style={s.catCountBadge}>{nbArticles} article(s)</span>
                        </div>
                        <div style={s.catActions}>
                          <button
                            style={s.catActionBtn}
                            onClick={() => {
                              setFilterCat(cat.id);
                              setActiveTab("articles");
                            }}
                          >
                            Voir les articles →
                          </button>
                          <button
                            style={{ ...s.actionBtn, color: C.danger }}
                            onClick={() => handleDeleteCategorie(cat.id, cat.designation)}
                            title="Supprimer"
                          >🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VUE FORMULAIRE ARTICLE (nouveau ou modifier) */}
      {(vue === "nouveau" || vue === "modifier") && (
        <div style={s.content}>
          <div style={s.card}>
            <h2 style={s.sectionTitle}>
              {vue === "nouveau" ? "➕ Nouvel article" : `✏️ Modifier — ${articleEdit?.designation}`}
            </h2>

            <form onSubmit={handleSaveArticle} noValidate>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>N° Article</label>
                  <input
                    type="text"
                    style={s.input}
                    placeholder="ex: 01.02.03"
                    value={formArticle.numero}
                    onChange={(e) => setFormArticle({ ...formArticle, numero: e.target.value })}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Catégorie *</label>
                  <select
                    style={s.input}
                    value={formArticle.categorie}
                    onChange={(e) => setFormArticle({ ...formArticle, categorie: e.target.value })}
                  >
                    <option value="">-- Choisir une catégorie --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.designation}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Désignation *</label>
                <input
                  type="text"
                  style={s.input}
                  placeholder="Description complète de l'article"
                  value={formArticle.designation}
                  onChange={(e) => setFormArticle({ ...formArticle, designation: e.target.value })}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Description / Détails</label>
                <textarea
                  style={s.textarea}
                  rows={3}
                  placeholder="Détails techniques, spécifications..."
                  value={formArticle.description}
                  onChange={(e) => setFormArticle({ ...formArticle, description: e.target.value })}
                />
              </div>

              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Unité *</label>
                  <select
                    style={s.input}
                    value={formArticle.unite}
                    onChange={(e) => setFormArticle({ ...formArticle, unite: e.target.value })}
                  >
                    {UNITES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Prix unitaire (DA)</label>
                  <input
                    type="number"
                    style={s.input}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formArticle.prixUnitaire}
                    onChange={(e) => setFormArticle({ ...formArticle, prixUnitaire: e.target.value })}
                  />
                </div>
              </div>

              {/* Aperçu prix */}
              {formArticle.prixUnitaire && (
                <div style={s.prixApercu}>
                  💰 Prix unitaire :{" "}
                  <strong style={{ color: C.primary }}>
                    {Number(formArticle.prixUnitaire).toLocaleString("fr-DZ")} DA / {formArticle.unite}
                  </strong>
                </div>
              )}

              <div style={s.formFooter}>
                <button
                  type="button"
                  style={s.btnSecondary}
                  onClick={() => { setVue("liste"); setArticleEdit(null); }}
                >
                  Annuler
                </button>
                <button type="submit" style={s.btnPrimary} disabled={saving}>
                  {saving ? "Enregistrement..." : vue === "nouveau" ? "💾 Créer l'article" : "💾 Modifier l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  breadcrumb: { fontSize: 13, color: "#64748b", marginBottom: 6 },
  breadcrumbLink: { color: "#1e3a5f", cursor: "pointer", fontWeight: 600 },
  breadcrumbSep: { margin: "0 8px" },
  title: { fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  headerActions: { display: "flex", gap: 12 },
  btnPrimary: { padding: "10px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { padding: "10px 20px", background: "#fff", color: "#1e293b", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  content: { padding: 32, maxWidth: 1200, margin: "0 auto" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", textAlign: "center" },
  statValue: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 13, color: "#64748b", marginTop: 4 },
  tabs: { display: "flex", gap: 4, marginBottom: 20 },
  tab: { padding: "10px 24px", background: "transparent", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#64748b", cursor: "pointer" },
  tabActive: { background: "#1e3a5f", color: "#fff", fontWeight: 600 },
  card: { background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 24, marginTop: 0 },
  filters: { display: "flex", gap: 12, marginBottom: 20 },
  searchInput: { flex: 1, padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" },
  select: { padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none" },
  tableWrapper: { overflowX: "auto", borderRadius: 8, border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px 14px", fontSize: 14, color: "#1e293b", verticalAlign: "middle" },
  numBadge: { background: "#eff6ff", color: "#1e40af", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 },
  articleDesc: { fontSize: 12, color: "#64748b", marginTop: 3 },
  catBadge: { background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actions: { display: "flex", gap: 8 },
  actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4, borderRadius: 6 },
  catForm: { background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" },
  catFormTitle: { fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 12, marginTop: 0 },
  catFormRow: { display: "flex", gap: 12, alignItems: "center" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  catCard: { border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 20, background: "#f8fafc" },
  catIcon: { fontSize: 32, marginBottom: 10 },
  catNom: { fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 8 },
  catCount: { marginBottom: 12 },
  catCountBadge: { background: "#dbeafe", color: "#1e40af", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  catActions: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  catActionBtn: { fontSize: 13, color: "#1e3a5f", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" },
  textarea: { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff", resize: "vertical", fontFamily: "inherit" },
  prixApercu: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1e293b", marginBottom: 16 },
  formFooter: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 },
  emptyState: { textAlign: "center", padding: 60 },
  emptyIcon: { fontSize: 48, display: "block", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#64748b", marginBottom: 20 },
  center: { textAlign: "center", padding: 40, color: "#64748b" },
  toast: { position: "fixed", bottom: 24, right: 24, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
};