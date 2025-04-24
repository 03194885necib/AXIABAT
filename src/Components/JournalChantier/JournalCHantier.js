import React, { useState, useEffect } from 'react';
import styles from './JournalDeChantierForm.module.css';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../../firebase'

function JournalDeChantierForm() {
  // États pour les informations générales
  const [chantier, setChantier] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [missionControle, setMissionControle] = useState('');
  const [date, setDate] = useState('');
  const [temps, setTemps] = useState('');
  const [horaireDebut, setHoraireDebut] = useState('');
  const [horaireFin, setHoraireFin] = useState('');
   const [personnel, setPersonnel] = useState([{ poste: '', nombre: '' }]);

  // États pour le matériel (liste d'objets) - MODIFIÉ pour inclure approvisionnement et quantité
  const [materiel, setMateriel] = useState([{ designation: '', quantite: '', marche: false, immobilise: false, panne: false }]);

  // États pour les travaux réalisés (liste d'objets)
  const [travauxRealises, setTravauxRealises] = useState([{ designation: '', observations: '' }]);

  // États pour la consommation de matériaux (liste d'objets)
  const [consommationMateriaux, setConsommationMateriaux] = useState([{ designation: '', stockMatin: '', approvisionnement: '', consomme: '', stockSoir: '' }]);

  // États pour les instructions
  const [instructionsOuvrage, setInstructionsOuvrage] = useState('');
  const [instructionsControle, setInstructionsControle] = useState('');

  // État pour vérifier si tous les champs obligatoires sont remplis
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialisation de Firestore
  const db = getFirestore(app);
  const journalCollection = collection(db, 'journauxDeChantier');

  // Fonctions pour gérer les changements dans les inputs

  // Informations générales
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'chantier': setChantier(value); break;
      case 'entreprise': setEntreprise(value); break;
      case 'missionControle': setMissionControle(value); break;
      case 'date': setDate(value); break;
      case 'temps': setTemps(value); break;
      case 'horaireDebut': setHoraireDebut(value); break;
      case 'horaireFin': setHoraireFin(value); break;
      default: break;
    }
  };

  // Personnel
  const handlePersonnelChange = (index, event) => {
    const { name, value } = event.target;
    const newPersonnel = [...personnel];
    newPersonnel[index][name] = value;
    setPersonnel(newPersonnel);
  };

  const addPersonnel = () => {
    setPersonnel([...personnel, { poste: '', nombre: '' }]);
  };

  const removePersonnel = (index) => {
    const newPersonnel = [...personnel];
    newPersonnel.splice(index, 1);
    setPersonnel(newPersonnel);
  };

  // Matériel - MODIFIÉ pour gérer approvisionnement et quantité
  const handleMaterielChange = (index, event) => {
    const { name, type, checked, value } = event.target;
    const newMateriel = [...materiel];
    newMateriel[index][name] = type === 'checkbox' ? checked : value;
    setMateriel(newMateriel);
  };

  const addMateriel = () => {
    setMateriel([...materiel, { designation: '', quantite: '', marche: false, immobilise: false, panne: false }]);
  };

  const removeMateriel = (index) => {
    const newMateriel = [...materiel];
    newMateriel.splice(index, 1);
    setMateriel(newMateriel);
  };

  // Travaux Réalisés
  const handleTravauxChange = (index, event) => {
    const { name, value } = event.target;
    const newTravaux = [...travauxRealises];
    newTravaux[index][name] = value;
    setTravauxRealises(newTravaux);
  };

  const addTravaux = () => {
    setTravauxRealises([...travauxRealises, { designation: '', observations: '' }]);
  };

  const removeTravaux = (index) => {
    const newTravaux = [...travauxRealises];
    newTravaux.splice(index, 1);
    setTravauxRealises(newTravaux);
  };

  // Consommation Matériaux
  const handleConsommationChange = (index, event) => {
    const { name, value } = event.target;
    const newConsommation = [...consommationMateriaux];
    newConsommation[index][name] = value;
    setConsommationMateriaux(newConsommation);
  };

  const addConsommation = () => {
    setConsommationMateriaux([...consommationMateriaux, { designation: '', stockMatin: '', approvisionnement: '', consomme: '', stockSoir: '' }]);
  };

  const removeConsommation = (index) => {
    const newConsommation = [...consommationMateriaux];
    newConsommation.splice(index, 1);
    setConsommationMateriaux(newConsommation);
  };

  // Instructions
  const handleInstructionsChange = (event) => {
    const { name, value } = event.target;
    if (name === 'instructionsOuvrage') setInstructionsOuvrage(value);
    if (name === 'instructionsControle') setInstructionsControle(value);
  };

  // Vérification de la validité du formulaire à chaque changement
  useEffect(() => {
    const isGeneralInfoValid = chantier && entreprise && date && horaireDebut && horaireFin;
    const isPersonnelValid = personnel.length > 0 && personnel.every(p => p.poste && p.nombre);
    // MODIFIÉ: Vérifie la présence de designation et quantite pour chaque matériel
    const isMaterielValid = materiel.length > 0 && materiel.every(m => m.designation && m.quantite);
    const isTravauxValid = travauxRealises.length > 0 && travauxRealises.every(t => t.designation);
    const isConsommationValid = consommationMateriaux.length > 0 && consommationMateriaux.every(c => c.designation);

    setIsFormValid(isGeneralInfoValid && isPersonnelValid && isMaterielValid && isTravauxValid && isConsommationValid);
  }, [chantier, entreprise, date, horaireDebut, horaireFin, personnel, materiel, travauxRealises, consommationMateriaux]);

  // Fonction pour enregistrer les données dans Firebase
  const saveToFirebase = async (formData) => {
    try {
      const docRef = await addDoc(journalCollection, formData);
      console.log('Document written with ID: ', docRef.id);
      alert('Journal de chantier enregistré avec succès!');
      // Réinitialiser le formulaire ici si nécessaire
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Erreur lors de l\'enregistrement du journal.');
    }
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isFormValid) {
      const formData = {
        chantier,
        entreprise,
        missionControle,
        date,
        temps,
        horaireDebut,
        horaireFin,
        personnel,
        materiel,
        travauxRealises,
        consommationMateriaux,
        instructionsOuvrage,
        instructionsControle,
        createdAt: new Date(), // Ajouter un timestamp pour l'enregistrement
      };
      await saveToFirebase(formData);
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Journal de Chantier</title>
          <style>
            body { font-family: sans-serif; margin: 20px; } /* Ajout de marges autour de la page */
            h1 { text-align: center; }
            .header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .header p { margin: 5px 0; }
            .section { border: 1px solid black; margin-bottom: 10px; } /* Cadre noir autour des sections */
            .section-title { background-color: #f0f0f0; text-align: center; font-weight: bold; padding: 5px; } /* Titres des sections grisés */
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid black; padding: 4px; text-align: left; vertical-align: top; } /* Bordures noires pour le tableau */
            .table th { background-color: #e0e0e0; font-weight: bold; }
            .observations { white-space: pre-wrap; }
            .visa-row { display: flex; justify-content: space-around; margin-top: 20px; }
            .visa-box { border-top: 1px solid black; padding-top: 5px; width: 30%; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Journal de Chantier</h1>

          <div class="header">
            <p>Chantier: ${chantier}</p>
            <p>Date: ${date}</p>
          </div>
          <div class="header">
            <p>Entreprise: ${entreprise}</p>
            <p>Temps: ${temps}</p>
          </div>
          <div class="header">
           
          </div>

          <div class="section">
            <div class="section-title">PERSONNEL</div>
            ${personnel.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Poste</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  ${personnel.map(p => `
                    <tr>
                      <td>${p.poste}</td>
                      <td>${p.nombre}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>Aucun personnel enregistré.</p>'}
          </div>

          <div class="section">
            <div class="section-title">MATERIEL</div>
            ${materiel.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Quantité</th>
                    <th>Marche</th>
                    <th>Immobilisé</th>
                    <th>Panne</th>
                  </tr>
                </thead>
                <tbody>
                  ${materiel.map(m => `
                    <tr>
                      <td>${m.designation}</td>
                      <td>${m.quantite}</td>
                      <td>${m.marche ? 'Oui' : 'Non'}</td>
                      <td>${m.immobilise ? 'Oui' : 'Non'}</td>
                      <td>${m.panne ? 'Oui' : 'Non'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>Aucun matériel enregistré.</p>'}
          </div>
  <div class="section">
            <div class="section-title">CONSOMMATION MATERIAUX</div>
            ${consommationMateriaux.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Stock Matin</th>
                    <th>Approvisionnement</th>
                    <th>Consommé</th>
                    <th>Stock Soir</th>
                  </tr>
                </thead>
                <tbody>
                  ${consommationMateriaux.map(c => `
                    <tr>
                      <td>${c.designation}</td>
                      <td>${c.stockMatin}</td>
                      <td>${c.approvisionnement}</td>
                      <td>${c.consomme}</td>
                      <td>${c.stockSoir}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>Aucune consommation de matériaux enregistrée.</p>'}
          </div>

          <div class="section">
            <div class="section-title">TRAVAUX REALISES</div>
            ${travauxRealises.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Observations</th>
                  </tr>
                </thead>
                <tbody>
                  ${travauxRealises.map(t => `
                    <tr>
                      <td>${t.designation}</td>
                      <td class="observations">${t.observations}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>Aucun travail réalisé enregistré.</p>'}
          </div>

        

          <div class="visa-row">
            <div class="visa-box">Visa du chef chantier</div>
           
            <div class="visa-box">Visa du chef de projet</div>
          </div>

        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };



  
  return (
    <form onSubmit={handleSubmit} className={styles['journal-chantier-form']}>
      <h2>Journal de Chantier</h2>

      <div className={styles.section}>
        <h3>Informations Générales</h3>
        <div className={styles['form-group']}>
          <label htmlFor="chantier">Chantier:</label>
          <input type="text" id="chantier" name="chantier" value={chantier} onChange={handleInputChange} required />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="entreprise">Entreprise:</label>
          <input type="text" id="entreprise" name="entreprise" value={entreprise} onChange={handleInputChange} required />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="missionControle">Mission de Contrôle:</label>
          <input type="text" id="missionControle" name="missionControle" value={missionControle} onChange={handleInputChange} />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" name="date" value={date} onChange={handleInputChange} required />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="temps">Temps:</label>
          <input type="text" id="temps" name="temps" value={temps} onChange={handleInputChange} />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="horaireDebut">Horaire de Travail (Début):</label>
          <input type="time" id="horaireDebut" name="horaireDebut" value={horaireDebut} onChange={handleInputChange} required />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="horaireFin">Horaire de Travail (Fin):</label>
          <input type="time" id="horaireFin" name="horaireFin" value={horaireFin} onChange={handleInputChange} required />
        </div>
      </div>

      {/* Personnel */}
      <div className={styles.section}>
        <h3>Personnel</h3>
        {personnel.map((personne, index) => (
          <div key={index} className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor={`poste-${index}`}>Poste:</label>
              <input
                type="text"
                id={`poste-${index}`}
                name="poste"
                value={personne.poste}
                onChange={(event) => handlePersonnelChange(index, event)}
                required={personnel.length === 1} // Au moins un personnel requis
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor={`nombre-${index}`}>Nombre:</label>
              <input
                type="number"
                id={`nombre-${index}`}
                name="nombre"
                value={personne.nombre}
                onChange={(event) => handlePersonnelChange(index, event)}
                required={personnel.length === 1}
              />
            </div>
            {personnel.length > 1 && (
              <button type="button" onClick={() => removePersonnel(index)} className={styles['remove-button']}>
                Supprimer
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addPersonnel} className={styles['add-button']}>
          Ajouter Personnel
        </button>
      </div>

      {/* Matériel - MODIFIÉ pour inclure les champs approvisionnement et quantité */}
      <div className={styles.section}>
        <h3>Matériel</h3>
        {materiel.map((item, index) => (
          <div key={index} className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor={`designation-materiel-${index}`}>Designation:</label>
              <input
                type="text"
                id={`designation-materiel-${index}`}
                name="designation"
                value={item.designation}
                onChange={(event) => handleMaterielChange(index, event)}
                required={materiel.length === 1} // Au moins un matériel requis
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor={`quantite-materiel-${index}`}>Nombre:</label>
              <input
                type="number"
                id={`quantite-materiel-${index}`}
                name="quantite"
                value={item.quantite}
                onChange={(event) => handleMaterielChange(index, event)}
                required={materiel.length === 1}
              />
            </div>
            {/* <div className={styles['form-group', styles['checkbox-group']]}>
              <label>Utilisation:</label>
              <label>
                Marche:
                <input
                  type="checkbox"
                  name="marche"
                  checked={item.marche}
                  onChange={(event) => handleMaterielChange(index, event)}
                />
              </label>
              <label>
                Immobilisé:
                <input
                  type="checkbox"
                  name="immobilise"
                  checked={item.immobilise}
                  onChange={(event) => handleMaterielChange(index, event)}
                />
              </label>
              <label>
                Panne:
                <input
                  type="checkbox"
                  name="panne"
                  checked={item.panne}
                  onChange={(event) => handleMaterielChange(index, event)}
                />
              </label>
            </div> */}
            {materiel.length > 1 && (
              <button type="button" onClick={() => removeMateriel(index)} className={styles['remove-button']}>
                Supprimer
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addMateriel} className={styles['add-button']}>
          Ajouter Matériel
        </button>
      </div>

{/* Approvisionnement */}

<div className={styles.section}>
        <h3>Approvisionnement</h3>
        {consommationMateriaux.map((consommation, index) => (
          <div key={index} className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor={`designation-conso-${index}`}>Désignation:</label>
              <input
                type="text"
                id={`designation-conso-${index}`}
                name="designation"
                value={consommation.designation}
                onChange={(event) => handleConsommationChange(index, event)}
                required={consommationMateriaux.length === 1} // Au moins une consommation requise
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor={`stockMatin-${index}`}>Quantité:</label>
              <input
                type="number"
                id={`stockMatin-${index}`}
                name="stockMatin"
                value={consommation.stockMatin}
                onChange={(event) => handleConsommationChange(index, event)}
              />
            </div>
           
            {consommationMateriaux.length > 1 && (
              <button type="button" onClick={() => removeConsommation(index)} className={styles['remove-button']}>
                Supprimer
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addConsommation} className={styles['add-button']}>
          Ajouter Matériau
        </button>
      </div>

      {/* Travaux Réalisés */}
      <div className={styles.section}>
        <h3>Travaux Réalisés</h3>
        {travauxRealises.map((travail, index) => (
          <div key={index} className={styles['form-row']}>
            <div className={styles['form-group', styles['full-width']]}>
              <label htmlFor={`designation-travaux-${index}`}>Désignation:</label>
              <input
                type="text"
                id={`designation-travaux-${index}`}
                name="designation"
                value={travail.designation}
                onChange={(event) => handleTravauxChange(index, event)}
                required={travauxRealises.length === 1} // Au moins un travail requis
              />
            </div>
            <div className={styles['form-group', styles['full-width']]}>
              <label htmlFor={`observations-${index}`}>Observations:</label>
              <textarea
                id={`observations-${index}`}
                name="observations"
                value={travail.observations}
                onChange={(event) => handleTravauxChange(index, event)}
              />
            </div>
            {travauxRealises.length > 1 && (
              <button type="button" onClick={() => removeTravaux(index)} className={styles['remove-button']}>
                Supprimer
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTravaux} className={styles['add-button']}>
          Ajouter Travaux
        </button>
      </div>

      {/* Consommation Matériaux */}
     

      {/* Instructions */}
      <div className={styles.section}>
        <h3>Instructions</h3>
        <div className={styles['form-group', styles['full-width']]}>
          <label htmlFor="instructionsOuvrage">Instructions du Maître de l'Ouvrage:</label>
          <textarea
            id="instructionsOuvrage"
            name="instructionsOuvrage"
            value={instructionsOuvrage}
            onChange={handleInstructionsChange}
          />
        </div>
        <div className={styles['form-group', styles['full-width']]}>
          <label htmlFor="instructionsControle">Instructions de la Mission de Contrôle:</label>
          <textarea
            id="instructionsControle"
            name="instructionsControle"
            value={instructionsControle}
            onChange={handleInstructionsChange}
          />
        </div>
      </div>

      {/* Visas (pourraient être des champs de texte ou des fonctionnalités de signature) */}
      <div className={styles.section}>
        <h3>Visas</h3>
        <div className={styles['form-group']}>
          <label>Visa de l'Entreprise:</label>
          <input type="text" readOnly placeholder="Signature ou Nom" />
        </div>
        <div className={styles['form-group']}>
          <label>Visa de la Mission de Contrôle:</label>
          <input type="text" readOnly placeholder="Signature ou Nom" />
        </div>
        <div className={styles['form-group']}>
          <label>Visa du Maître de l'Ouvrage:</label>
          <input type="text" readOnly placeholder="Signature ou Nom" />
        </div>
      </div>

      <button type="submit" disabled={!isFormValid} className={styles['submit-button']}>Enregistrer le Journal</button>
      <button type="button" onClick={handlePrint} className={styles['print-button']}>Imprimer le Journal</button>
    </form>
  );
}

export default JournalDeChantierForm;