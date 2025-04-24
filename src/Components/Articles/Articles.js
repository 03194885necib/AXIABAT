import React, { useState, useEffect } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from 'firebase/firestore';
import SelectInput from '../FicheProjet/SelectInput';
import {
  Container, Card, Header, Title, FormGroup, FormLabel, Button,
} from '../Styled'; // Assurez-vous que le chemin vers votre fichier Styled.js est correct
import './articles.css'; // Créez ce fichier CSS pour le style spécifique

const NewArticleSelectorTable = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articlesInCategory, setArticlesInCategory] = useState([]);
  const [newArticleDesignation, setNewArticleDesignation] = useState('');
  const [newArticleUnite, setNewArticleUnite] = useState('');
  const [selectedNewArticles, setSelectedNewArticles] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().designation || `Catégorie ${doc.id}`,
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      if (selectedCategory) {
        try {
          const querySnapshot = await getDocs(collection(db, 'articles'));
          const articleList = querySnapshot.docs
            .filter(doc => doc.data().categorie === selectedCategory)
            .map(doc => ({
              id: doc.id,
              designation: doc.data().designation,
              unite: doc.data().unite,
            }));
          setArticlesInCategory(articleList);
        } catch (error) {
          console.error("Erreur lors de la récupération des articles :", error);
        }
      } else {
        setArticlesInCategory([]);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleAddSelectedArticle = (article) => {
    if (!selectedNewArticles.some(a => a.id === article.id)) {
      setSelectedNewArticles([...selectedNewArticles, article]);
    }
  };

  const handleRemoveSelectedArticle = (articleId) => {
    setSelectedNewArticles(selectedNewArticles.filter(a => a.id !== articleId));
  };

  const handleNewArticleDesignationChange = (event) => {
    setNewArticleDesignation(event.target.value);
  };

  const handleNewArticleUniteChange = (event) => {
    setNewArticleUnite(event.target.value);
  };

  const handleAddNewArticle = async () => {
    if (selectedCategory && newArticleDesignation.trim() && newArticleUnite.trim()) {
      try {
        const docRef = await addDoc(collection(db, 'articles'), {
          categorie: selectedCategory,
          designation: newArticleDesignation.trim(),
          unite: newArticleUnite.trim(),
        });
        console.log("Nouvel article ajouté avec l'ID : ", docRef.id);
        setNewArticleDesignation('');
        setNewArticleUnite('');
        // Refetch les articles pour mettre à jour la liste
        const querySnapshot = await getDocs(collection(db, 'articles'));
        const articleList = querySnapshot.docs
          .filter(doc => doc.data().categorie === selectedCategory)
          .map(doc => ({
            id: doc.id,
            designation: doc.data().designation,
            unite: doc.data().unite,
          }));
        setArticlesInCategory(articleList);
      } catch (error) {
        console.error("Erreur lors de l'ajout du nouvel article :", error);
      }
    } else {
      alert("Veuillez sélectionner une catégorie et remplir la désignation et l'unité du nouvel article.");
    }
  };

  const handleNewCategoryNameChange = (event) => {
    setNewCategoryName(event.target.value);
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const docRef = await addDoc(collection(db, 'categories'), {
          designation: newCategoryName.trim(),
        });
        console.log("Nouvelle catégorie ajoutée avec l'ID : ", docRef.id);
        setNewCategoryName('');
        setShowAddCategory(false);
        // Refetch les catégories pour mettre à jour la liste
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().designation || `Catégorie ${doc.id}`,
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Erreur lors de l'ajout de la nouvelle catégorie :", error);
      }
    } else {
      alert("Veuillez entrer un nom pour la nouvelle catégorie.");
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Title>Mes articles </Title>
        </Header>

        <div className="category-management-section">
        
           <div className="category-section">
  <label htmlFor="category" className="category-label">Catégorie</label>
  <SelectInput
    id="category"
    value={selectedCategory}
    onChange={handleCategoryChange}
    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
    className="category-select" // Exemple pour styliser le SelectInput
  />
</div>

          {!showAddCategory && (
            <Button onClick={() => setShowAddCategory(true)} className="add-category-button">Ajouter une nouvelle catégorie</Button>
          )}
          {showAddCategory && (
            <div className="add-category-form">
              <FormGroup>
                <FormLabel htmlFor="newCategoryName">Nom de la nouvelle catégorie</FormLabel>
                <input
                  type="text"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={handleNewCategoryNameChange}
                  className="new-category-input"
                />
              </FormGroup>
              <Button onClick={handleAddCategory} className="add-category-submit-button">Ajouter Catégorie</Button>
              <Button onClick={() => setShowAddCategory(false)} className="cancel-category-button">Annuler</Button>
            </div>
          )}
        </div>

        {selectedCategory && (
          <div className="articles-table-section">
            <h3>Articles dans la catégorie "{categories.find(cat => cat.id === selectedCategory)?.name}"</h3>
            {articlesInCategory.length > 0 ? (
              <table className="articles-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Unité</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {articlesInCategory.map(article => (
                    <tr key={article.id}>
                      <td>{article.designation}</td>
                      <td>{article.unite}</td>
                      <td>
                        <Button onClick={() => handleAddSelectedArticle(article)} className="add-button">Ajouter</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun article trouvé dans cette catégorie.</p>
            )}
          </div>
        )}

        <div className="new-article-section">
          <h3>Ajouter un nouvel article à la catégorie "{categories.find(cat => cat.id === selectedCategory)?.name}"</h3>
          <FormGroup>
            <FormLabel htmlFor="newDesignation">Désignation</FormLabel>
            <input
              type="text"
              id="newDesignation"
              value={newArticleDesignation}
              onChange={handleNewArticleDesignationChange}
              className="new-article-input"
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="newUnite">Unité</FormLabel>
            <input
              type="text"
              id="newUnite"
              value={newArticleUnite}
              onChange={handleNewArticleUniteChange}
              className="new-article-input"
            />
          </FormGroup>
          <Button onClick={handleAddNewArticle} className="add-new-article-button">Ajouter Nouvel Article</Button>
        </div>

        {selectedNewArticles.length > 0 && (
          <div className="selected-articles-section">
            <h3>Articles sélectionnés</h3>
            <table className="selected-articles-table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Unité</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedNewArticles.map(article => (
                  <tr key={article.id}>
                    <td>{article.designation}</td>
                    <td>{article.unite}</td>
                    <td>
                      <Button onClick={() => handleRemoveSelectedArticle(article.id)} className="remove-button">Supprimer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="use-articles-button-row">
              <Button onClick={() => console.log("Articles sélectionnés :", selectedNewArticles)} className="use-articles-button">Utiliser les articles sélectionnés</Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default NewArticleSelectorTable;