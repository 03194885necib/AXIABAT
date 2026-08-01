import React, { useState, useEffect } from 'react';
import { db } from "../../firebase"; 
import { collection, getDocs, query, where } from 'firebase/firestore';

const CategoryDropdown = ({ project, selectedArticles, setSelectedArticles }) => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().designation || `Catégorie ${doc.id}`
      }));
      setCategories(cats);
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (categoryId) => {
    if (articles[categoryId]) {
      setActiveCategory(activeCategory === categoryId ? null : categoryId);
      return;
    }

    setLoadingArticles(true);
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
    
    setLoadingArticles(false);
  };

  const handleSelectArticle = (article) => {
    setSelectedArticles(prev => {
      const isAlreadySelected = prev.some(item => item.id === article.id);
      return isAlreadySelected
        ? prev.filter(item => item.id !== article.id)
        : [...prev, article];
    });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinalSubmit = () => {
    console.log('Projet:', project);
    console.log('Articles sélectionnés:', selectedArticles);
    // Ici vous pourriez envoyer les données à votre API ou Firebase
    alert(`Projet "${project.name}" créé avec ${selectedArticles.length} articles!`);
  };

  return (
    <div className="category-container">
      <div className="project-info">
        <h2>Projet: {project.name} (ID: {project.id})</h2>
      </div>

      <input
        type="text"
        placeholder="Rechercher une catégorie..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {loadingCategories ? (
        <p>Chargement des catégories...</p>
      ) : (
        <>
          <div className="category-list">
            {filteredCategories.map((category) => (
              <div key={category.id} className="category-item">
                <div 
                  className="category-header"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                  <span className="toggle-icon">
                    {activeCategory === category.id ? '−' : '+'}
                  </span>
                </div>
                
                {activeCategory === category.id && (
                  <ul className="subcategory-list">
                    {loadingArticles ? (
                      <li>Chargement des articles...</li>
                    ) : articles[category.id] ? (
                      articles[category.id].length > 0 ? (
                        articles[category.id].map((article) => (
                          <li 
                            key={article.id} 
                            className={`subcategory-item ${
                              selectedArticles.some(item => item.id === article.id) ? 'selected' : ''
                            }`}
                            onClick={() => handleSelectArticle(article)}
                          >
                            {article.designation} - {article.prix}€ ({article.quantite} {article.unite})
                          </li>
                        ))
                      ) : (
                        <li className="subcategory-item">Aucun article dans cette catégorie</li>
                      )
                    ) : null}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="selected-articles">
            <h3>Articles sélectionnés ({selectedArticles.length})</h3>
            {selectedArticles.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Unité</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedArticles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.designation}</td>
                      <td>{article.prix}€</td>
                      <td>{article.quantite}</td>
                      <td>{article.unite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun article sélectionné</p>
            )}
          </div>

          <button 
            onClick={handleFinalSubmit}
            className="submit-btn"
            disabled={selectedArticles.length === 0}
          >
            Créer le projet avec les articles sélectionnés
          </button>
        </>
      )}
    </div>
  );
};

export default CategoryDropdown;