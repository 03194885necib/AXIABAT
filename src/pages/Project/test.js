
// import React, { useState, useEffect } from 'react';
// import { db } from "../../firebase"; 
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import './test.css';

// const CategoryDropdown = () => {
//   const [categories, setCategories] = useState({});
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);

//   // Charger les catégories et leurs articles
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
      
//       // 1. Charger toutes les catégories
//       const categoriesSnapshot = await getDocs(collection(db, 'categories'));
//       const categoriesData = {};
      
//       // 2. Pour chaque catégorie, charger ses articles
//       for (const categoryDoc of categoriesSnapshot.docs) {
//         const categoryId = categoryDoc.id;
//         const categoryName = categoryDoc.data().designation || `Catégorie ${categoryId}`;
        
//         // Requête pour les articles de cette catégorie
//         const articlesQuery = query(
//           collection(db, 'articles'),
//           where('categorie', '==', categoryId)
//         );
//         const articlesSnapshot = await getDocs(articlesQuery);
        
//         // Format: "Designation (quantité)"
//         categoriesData[categoryName] = articlesSnapshot.docs.map(doc => {
//           const article = doc.data();
//           return `${article.designation}`;
//         });
//       }
      
//       setCategories(categoriesData);
//       setLoading(false);
//     };

//     fetchData();
//   }, []);

//   // Filtrage des catégories
//   const filteredCategories = Object.keys(categories).filter(cat => 
//     cat.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="category-container">
//       <h2>Liste des Catégories</h2>
      
//       {/* Barre de recherche */}
//       <input
//         type="text"
//         placeholder="Rechercher une catégorie..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="search-input"
//       />

//       {loading ? (
//         <p>Chargement en cours...</p>
//       ) : (
//         <div className="category-list">
//           {filteredCategories.map((category) => (
//             <div key={category} className="category-item">
//               <div 
//                 className="category-header"
//                 onClick={() => setActiveCategory(activeCategory === category ? null : category)}
//               >
//                 {category}
//                 <span className="toggle-icon">
//                   {activeCategory === category ? '−' : '+'}
//                 </span>
//               </div>
              
//               {activeCategory === category && (
//                 <ul className="subcategory-list">
//                   {categories[category].length > 0 ? (
//                     categories[category].map((article, index) => (
//                       <li key={index} className="subcategory-item">
//                         {article}
//                       </li>
//                     ))
//                   ) : (
//                     <li className="subcategory-item">Aucun article dans cette catégorie</li>
//                   )}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CategoryDropdown;
import React, { useState, useEffect } from 'react';
import { db } from "../../firebase"; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import './test.css';

const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]); // Tableau pour stocker les articles sélectionnés

  // Charger les catégories
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

  // Charger les articles d'une catégorie
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

  // Sélectionner un article
  const handleSelectArticle = (article) => {
    setSelectedArticles(prev => {
      // Vérifier si l'article est déjà sélectionné
      const isAlreadySelected = prev.some(item => item.id === article.id);
      
      if (isAlreadySelected) {
        // Retirer l'article s'il est déjà sélectionné
        return prev.filter(item => item.id !== article.id);
      } else {
        // Ajouter l'article s'il n'est pas déjà sélectionné
        return [...prev, article];
      }
    });
  };

  // Filtrage des catégories
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-container">
      <h2>Liste des Catégories</h2>
      
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

          {/* Section pour afficher les articles sélectionnés */}
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedArticles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.designation}</td>
                      <td>{article.prix}€</td>
                      <td>{article.quantite}</td>
                      <td>{article.unite}</td>
                      <td>
                        <button 
                          onClick={() => handleSelectArticle(article)}
                          className="remove-btn"
                        >
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun article sélectionné</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryDropdown;