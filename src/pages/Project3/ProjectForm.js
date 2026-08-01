import React, { useState } from 'react';
import { db } from "../../firebase"; 
import { collection, addDoc } from 'firebase/firestore';
import ProjectDetailsForm from './ProjectDetailsForm';
import ArticleSelection from './ArticleSelection';

const ProjectForm = () => {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState({ id: '', name: '',description:"",banque:'',dateDebut:"",delai:"",dateFin:"" });
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [projectArticles, setProjectArticles] = useState([]);

  // Passer à l'étape de sélection des articles
  const handleProjectSubmit = (projectData) => {
    setProject(projectData);
    setStep(2);
  };

  // Finaliser la création du projet
  const handleFinalSubmit = async () => {
    try {
      // Enregistrer le projet dans Firebase
      const projectRef = await addDoc(collection(db, 'projects'), {
        id: project.id,
        name: project.name,
        description:project.description,
        banque:project.banque,
        dateDebut:project.dateDebut,
        delai:project.dateFin,
        dateFin:project.dateFin,
        createdAt: new Date()
      });

      // Enregistrer chaque articleProjet
      const batch = [];
      for (const article of projectArticles) {
        await addDoc(collection(db, 'projectArticles'), {
          projectId: projectRef.id,
          articleId: article.id,
          designation: article.designation,
          prix: article.prix,
          quantite: article.quantite,
          unite: article.unite,
          valeurAjoutee: article.valeurAjoutee,
          metal: article.metal,
          createdAt: new Date()
        });
      }

      alert('Projet et articles enregistrés avec succès!');
      // Réinitialiser le formulaire
      setStep(1);
      setProject({ id: '', name: '' ,description:"",banque:'',dateDebut:"",delai:"",dateFin:""});
      setSelectedArticles([]);
      setProjectArticles([]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement: ", error);
      alert('Une erreur est survenue');
    }
  };

  return (
    <div className="project-form-container">
     
      {step === 1 && (
        <ProjectDetailsForm 
          onSubmit={handleProjectSubmit} 
          initialData={project} 
        />
      )}

      {step === 2 && (
        <ArticleSelection
          project={project}
          selectedArticles={selectedArticles}
          setSelectedArticles={setSelectedArticles}
          projectArticles={projectArticles}
          setProjectArticles={setProjectArticles}
          onFinalSubmit={handleFinalSubmit}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
};

export default ProjectForm;