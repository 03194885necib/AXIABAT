import React, { useState } from 'react';
import CategoryDropdown from './CategoryDropdown ';
import './style.css';
import './test.css';

const ProjectForm = () => {
  const [project, setProject] = useState({ id: '', name: '' });
  const [step, setStep] = useState(1); // 1 = formulaire, 2 = catégories
  const [selectedArticles, setSelectedArticles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project.id || !project.name) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setStep(2); // Passer à l'étape suivante
  };

  if (step === 1) {
    return (
      <div className="project-form-container">
        <h2>Créer un nouveau projet</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID du projet:</label>
            <input
              type="text"
              name="id"
              value={project.id}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nom du projet:</label>
            <input
              type="text"
              name="name"
              value={project.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="next-btn">
            Suivant
          </button>
        </form>
      </div>
    );
  }

  return (
    <CategoryDropdown 
      project={project} 
      selectedArticles={selectedArticles}
      setSelectedArticles={setSelectedArticles}
    />
  );
};

export default ProjectForm;