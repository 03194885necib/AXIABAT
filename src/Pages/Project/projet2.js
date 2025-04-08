import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "./projet2.css";

function Projects() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    bank: "",
    amount: "",
    approvalDate: "",
    executionTime: "",
    startDate: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoryList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCategories(categoryList);
  };

  const fetchArticles = async (categoryId) => {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articleList = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((article) => article.categorie === categoryId);
    setArticles(articleList);
  };

  const openProjectModal = () => setIsProjectModalOpen(true);
  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setStep(1);
    setSelectedArticles([]);
  };

  const handleNextStep = () => setStep(step + 1);
  const handlePreviousStep = () => setStep(step - 1);

  const handleCategorySelection = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchArticles(categoryId);
  };

  const toggleArticleSelection = (article) => {
    setSelectedArticles((prev) => {
      if (prev.find((a) => a.id === article.id)) {
        return prev.filter((a) => a.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  return (
    <div className="projects-container">
      <button className="projects-btn" onClick={openProjectModal}>Ajouter Projet</button>
      {isProjectModalOpen && (
        <div className="projects-modal">
          <div className="projects-modal-content">
            <span className="projects-close" onClick={closeProjectModal}>&times;</span>
            {step === 1 && (
              <div>
                <h3>Informations Générales</h3>
                <input type="text" placeholder="Nom du projet" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value })} />
                <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value })}></textarea>
                <input type="text" placeholder="Banque Associée" value={newProject.bank} onChange={(e) => setNewProject({...newProject, bank: e.target.value })} />
                <button onClick={handleNextStep}>Suivant</button>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3>Sélection des Articles</h3>
                <select onChange={(e) => handleCategorySelection(e.target.value)}>
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.designation}</option>
                  ))}
                </select>
                <ul>
                  {articles.map((article) => (
                    <li key={article.id}>
                      <input
                        type="checkbox"
                        checked={selectedArticles.some((a) => a.id === article.id)}
                        onChange={() => toggleArticleSelection(article)}
                      />
                      {article.designation}
                    </li>
                  ))}
                </ul>
                <button onClick={handlePreviousStep}>Précédent</button>
                <button onClick={handleNextStep}>Suivant</button>
              </div>
            )}
            {step === 3 && (
              <div>
                <h3>Attribution des Prix et Quantités</h3>
                {selectedArticles.map((article) => (
                  <div key={article.id}>
                    <span>{article.designation}</span>
                    <input type="number" placeholder="Prix" onChange={(e) => article.prix = e.target.value} />
                    <input type="number" placeholder="Quantité" onChange={(e) => article.quantite = e.target.value} />
                  </div>
                ))}
                <button onClick={handlePreviousStep}>Précédent</button>
                <button onClick={closeProjectModal}>Terminer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
