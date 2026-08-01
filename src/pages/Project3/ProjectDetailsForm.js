import React, { useState } from 'react';

const ProjectDetailsForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="project-details-form">
      <h2>Création de projet</h2>
      
      <div className="form-group">
        <label>ID du projet:</label>
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Nom du projet:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Description du projet:</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Banque  du projet:</label>
        <input
          type="text"
          name="banque"
          value={formData.banque}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>date Debut du projet:</label>
        <input
          type='date'
          name="dateDebut"
          value={formData.dateDebut}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Delai du projet:</label>
        <input
          type="text"
          name="delai"
          value={formData.delai}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>date fin du projet:</label>
        <input
          type="date"
          name="dateFin"
          value={formData.dateFin}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="next-btn">
        Suivant
      </button>
    </form>
  );
};

export default ProjectDetailsForm;