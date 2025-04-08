import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; 
import { db } from "../../firebase"; 
import "./articles.css"; 
import { useNavigate } from "react-router-dom";

function Articles() {
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articles, setArticles] = useState([]); // Liste des articles
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newArticle, setNewArticle] = useState({
    categorie: "",
    numero: "",
    designation: "",
    unite: "",
  
  });

  // Fonction pour récupérer les catégories depuis Firestore
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoryList);
  };

  // Fonction pour récupérer les articles depuis Firestore et ajouter le nom de la catégorie
  const fetchArticles = async () => {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articleList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const category = categories.find(cat => cat.id === data.categorie);
      return { id: doc.id, ...data, categoryName: category ? category.designation : "Inconnu" };
    });
    setArticles(articleList);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchArticles();
    }
  }, [categories]);

  const openArticleModal = () => {
    setNewArticle({ categorie: "", numero: "", designation: "", unite: "" });
    setIsArticleModalOpen(true);
  };

  const closeArticleModal = () => setIsArticleModalOpen(false);

  // Gérer les changements dans le formulaire
  const handleChangeArticle = (e) => {
    setNewArticle({ ...newArticle, [e.target.name]: e.target.value });
  };

  // Ajouter un nouvel article
  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.categorie) {
      alert("Veuillez sélectionner une catégorie.");
      return;
    }
    try {
      await addDoc(collection(db, "articles"), newArticle);
      console.log("Article ajouté avec succès !");
      closeArticleModal();
      fetchArticles();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  // Supprimer un article
  const handleDeleteArticle = async (articleId) => {
    try {
      await deleteDoc(doc(db, "articles", articleId));
      console.log("Article supprimé !");
      fetchArticles();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const newCategorie = () => {
    navigate("/template/Catégorie");
  };

  return (
    <div className="articles-container">
      <div className="articles-details">
        <div className="articles-header">
          <h2>Articles</h2>
          <button className="articles-btn" onClick={newCategorie}>Nouvelle Catégorie</button>
        </div>
        <button className="articles-btn" onClick={openArticleModal}>Nouvel Article</button>
        <br /><br /><br />
        <table className="articles-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Désignation</th>
              <th>Unité</th>
              
              <th>Catégorie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.numero}</td>
                <td>{article.designation}</td>
                <td>{article.unite}</td>
               
                <td>{article.categoryName}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteArticle(article.id)}>🗑️ Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isArticleModalOpen && (
        <div className="articles-modal">
          <div className="articles-modal-content">
            <span className="articles-close" onClick={closeArticleModal}>&times;</span>
            <h3>Ajouter un nouvel article</h3>
            <form onSubmit={handleSubmitArticle}>
              <select 
                name="categorie" 
                value={newArticle.categorie} 
                onChange={handleChangeArticle}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.designation}
                  </option>
                ))}
              </select>
              <input type="text" name="numero" placeholder="Numéro de l'article" value={newArticle.numero} onChange={handleChangeArticle} required />
              <input type="text" name="designation" placeholder="Désignation" value={newArticle.designation} onChange={handleChangeArticle} required />
              <input type="text" name="unite" placeholder="Unité de mesure" value={newArticle.unite} onChange={handleChangeArticle} required />
              <button type="submit">Ajouter</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Articles;
