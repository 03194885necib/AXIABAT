import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../firebase"; 
import Test from './test'
import "./projet.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(""); // Projet sélectionné pour l'ajout d'article
  const [articles, setArticles] = useState([]); // Liste des articles existants
  const [selectedArticles, setSelectedArticles] = useState([]);
  const[SecondStep,setSecondStep]=useState(false)
  const [categories, setCategories] = useState([]);  // Liste des catégories
const [selectedCategory, setSelectedCategory] = useState("");  // Catégorie choisie
const [filteredArticles, setFilteredArticles] = useState([]);  // Articles filtrés
const navigate=useNavigate()
  // État pour stocker les données d'un projet
  const [project, setProject] = useState({
    name: "",
    description: "",
    banque: "",
    date_approbation: "",
    delai: "",
    date_demarrage: "",
    status: "bien",
    articles: ""
  });

  // État pour stocker les données d'un article
  const [article, setArticle] = useState({
    numero: "",
    designation: "",
    unite: "",
    quantite: "",
    prix: ""
  });


  const handleNextStep = (e) => {
    e.preventDefault();
    setSecondStep(true);
  };
  
  const handlePreviousStep = () => {
    setSecondStep(false);
  };
  
  // Fonction pour récupérer les projets depuis Firebase
  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projectList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(projectList);
  };
  const fetchArticles = async () => {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articleList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setArticles(articleList);
  };

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoryList);
  };
  useEffect(() => {
    fetchProjects();
    fetchArticles();
    fetchCategories();
  }, []);

  const openProjectModal = () => {
    setSelectedArticles([]); // Réinitialiser la liste des articles sélectionnés
    setIsProjectModalOpen(true);
  };
  
  const closeProjectModal = () => setIsProjectModalOpen(false);
  const openArticleModal = (projectId) => {
    setSelectedProjectId(projectId);
    setIsArticleModalOpen(true);
  };
  const closeArticleModal = () => setIsArticleModalOpen(false);

  // Gérer les changements dans les inputs
  const handleChangeProject = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };






 

  // Ajouter un article à un projet spécifique
  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    try {
      await addDoc(collection(db, `projects/${selectedProjectId}/articles`), article);
      console.log("Article ajouté avec succès !");
      closeArticleModal();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'article :", error);
    }
  };


  
  const test =()=>{
    navigate("/template/Test")
  }
  const AjouterProjet =()=>{
    navigate("/template/AjouterProjet")
  }
  const ProjectForm =()=>{
    navigate("/template/ProjectForm")
  }
  return (
    <div className="home-container">
      <div className="home-details">
        <div className="home-recentOrders">
          <div className="home-cardHeader">
            <h2>Projects</h2>
            {/* <button className="home-btn" onClick={openProjectModal}>New Project</button>
            <button className="home-btn" onClick={test}>test</button>
            <button className="home-btn" onClick={AjouterProjet}>new Project</button> */}
            <button className="home-btn" onClick={ProjectForm}>ProjectForm</button>
          </div>

          {/* Tableau des projets */}
          <table className="home-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Banque</th>
                <th>Date Approbation</th>
                <th>Délais</th>
                <th>Date Démarrage</th>
                <th>Status</th>
                <th>Articles</th>
               
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj.id}>
                  <td>{proj.name}</td>
                  <td>{proj.description}</td>
                  <td>{proj.banque}</td>
                  <td>{proj.date_approbation}</td>
                  <td>{proj.delai}</td>
                  <td>{proj.date_demarrage}</td>
                  <td>{proj.status}</td>
                  <td>{proj.articles}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> 


  

{isProjectModalOpen && (
  <div className="home-modal">
    <div className="home-modal-content">
      <span className="home-close" onClick={closeProjectModal}>&times;</span>
      
      <h3>Créer un nouveau projet</h3>

      {!SecondStep ? (
        // Étape 1 : Formulaire de base du projet
        <form onSubmit={handleNextStep}>
          <input type="text" name="name" placeholder="Nom du projet" value={project.name} onChange={handleChangeProject} required />
          <input type="text" name="description" placeholder="Description" value={project.description} onChange={handleChangeProject} required />
          <input type="text" name="banque" placeholder="Banque" value={project.banque} onChange={handleChangeProject} required />
          <input type="date" name="date_approbation" value={project.date_approbation} onChange={handleChangeProject} required />
          <input type="text" name="delai" placeholder="Délai" value={project.delai} onChange={handleChangeProject} required />
          <input type="date" name="date_demarrage" value={project.date_demarrage} onChange={handleChangeProject} required />
          
          <button type="submit">Suivant</button>
        </form>
      ) : (
        // Étape 2 : Ajouter des articles au projet
        <div>
          <Test></Test>
         

        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
}

export default Home;
