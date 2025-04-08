import React, { useState, useEffect } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';
import './ProjectForm.css'

const ArticleSelection = ({
  project,
  selectedArticles,
  setSelectedArticles,
  projectArticles,
  setProjectArticles,
  onFinalSubmit,
  onBack
}) => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().designation || `Catégorie ${doc.id}`
      }));
      setCategories(cats);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  // Charger les articles d'une catégorie
  const handleCategoryClick = async (categoryId) => {
    if (articles[categoryId]) {
      setActiveCategory(activeCategory === categoryId ? null : categoryId);
      return;
    }

    setLoading(true);
    setActiveCategory(categoryId);

    const articlesQuery = query(
      collection(db, 'articles'),
      where('categorie', '==', categoryId)
    );
    const articlesSnapshot = await getDocs(articlesQuery);

    setArticles(prev => ({
      ...prev,
      [categoryId]: articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }));

    setLoading(false);
  };

  // Sélectionner un article
  const handleSelectArticle = (article) => {
    setSelectedArticles(prev => {
      const isSelected = prev.some(a => a.id === article.id);
      return isSelected
        ? prev.filter(a => a.id !== article.id)
        : [...prev, article];
    });
  };

  // Modifier les détails d'un article
  const handleEditArticle = (article) => {
    setEditingArticle(article);
  };

  
  const handleSaveArticleDetails = (updatedArticle) => {
    // Supprime les champs undefined
    const cleanedArticle = Object.fromEntries(
      Object.entries(updatedArticle).filter(([_, v]) => v !== undefined)
    );
  
    setProjectArticles(prev => {
      const exists = prev.some(a => a.id === cleanedArticle.id);
      return exists
        ? prev.map(a => a.id === cleanedArticle.id ? cleanedArticle : a)
        : [...prev, cleanedArticle];
    });
  
    setEditingArticle(null);
  };
  

  return (
    <div className="article-selection-container">
      <div className="project-header">
        <h2>Projet: {project.name}</h2>
        <button onClick={onBack} className="back-btn">
          Retour
        </button>
      </div>

      <div className="selection-panels">
        {/* Panneau de sélection des articles */}
        <div className="category-panel">
          <h3>Sélectionnez des articles</h3>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="category-list">
              {categories.map(category => (
                <div key={category.id} className="category-item">
                  <div
                    className="category-header"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name}
                    <span>{activeCategory === category.id ? '−' : '+'}</span>
                  </div>

                  {activeCategory === category.id && articles[category.id] && (
                    <ul className="article-list">
                      {articles[category.id].map(article => (
                        <li
                          key={article.id}
                          className={`article-item ${selectedArticles.some(a => a.id === article.id) ? 'selected' : ''
                            }`}
                          onClick={() => handleSelectArticle(article)}
                        >
                          {article.designation}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panneau d'édition des articles */}
        <div className="edit-panel">
          <h3>Articles sélectionnés ({selectedArticles.length})</h3>

          {selectedArticles.length === 0 ? (
            <p>Aucun article sélectionné</p>
          ) : (
            <div className="selected-articles">
              {selectedArticles.map(article => {
                const projectArticle = projectArticles.find(a => a.id === article.id) || article;
                const isEdited = editingArticle?.id === article.id;

                return (
                  <div key={article.id} className="selected-article">
                    {isEdited ? (
                      <ArticleEditForm
                        article={projectArticle}
                        onSave={handleSaveArticleDetails}
                        onCancel={() => setEditingArticle(null)}
                      />
                    ) : (
                      <>
                        <div className="article-info">
                          <h4>{article.designation}</h4>
                         
                          {projectArticle.prixArticle && (
                            <p>prixArticle: {projectArticle.prixArticle}</p>
                          )}

                          {projectArticle.quantiteArticle && (
                            <p>quantiteArticle: {projectArticle.quantiteArticle}</p>
                          )}
                          {/* {projectArticle.metal && (
                            <p>Métal: {projectArticle.metal}</p>
                          )} */}
                        </div>
                        <button
                          onClick={() => handleEditArticle(projectArticle)}
                          className="edit-btn"
                        >
                          Modifier
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedArticles.length > 0 && (
            <button
              onClick={onFinalSubmit}
              className="submit-btn"
              disabled={projectArticles.length !== selectedArticles.length}
            >
              Valider le projet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour éditer un article
const ArticleEditForm = ({ article, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    prixArticle: article.prixArticle || '',
    // metal: article.metal || '',
    quantite: article.quantiteArticle || 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...article, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="article-edit-form">
      <div className="form-group">
        <label>Quantité:</label>
        <input
          type="number"
          name="quantiteArticle"
          value={formData.quantiteArticle}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>Prix:</label>
        <input
          type="text"
          name="prixArticle"
          value={formData.prixArticle}
          onChange={handleChange}
        />
      </div>

      {/* <div className="form-group">
        <label>Métal:</label>
        <select
          name="metal"
          value={formData.metal}
          onChange={handleChange}
        >
          <option value="">-- Sélectionnez --</option>
          <option value="Acier">Acier</option>
          <option value="Aluminium">Aluminium</option>
          <option value="Cuivre">Cuivre</option>
          <option value="Inox">Inox</option>
        </select>
      </div> */}


      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Annuler
        </button>
        <button type="submit" className="save-btn">
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default ArticleSelection;