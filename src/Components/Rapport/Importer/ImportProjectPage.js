// // import React, { useState, useEffect } from 'react';
// // import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
// // import { db } from '../../../firebase'; 
// // import './ImportProjectPage.css'; 

// // const ImportProjectPage = () => {
// //   const [projects, setProjects] = useState([]);
// //   const [selectedProjectId, setSelectedProjectId] = useState('');
// //   const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
// //   const [projectDecomptes, setProjectDecomptes] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchProjects = async () => {
// //       try {
// //         setLoading(true);
// //         const projectsCollectionRef = collection(db, 'projects');
// //         const projectSnapshot = await getDocs(projectsCollectionRef);
// //         const projectsList = projectSnapshot.docs.map(doc => ({
// //           id: doc.id,
// //           ...doc.data()
// //         }));
// //         setProjects(projectsList);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error("Error fetching projects:", err);
// //         setError("Impossible de charger les projets. Veuillez réessayer.");
// //         setLoading(false);
// //       }
// //     };

// //     fetchProjects();
// //   }, []);

// //   useEffect(() => {
// //     const fetchProjectData = async () => {
// //       if (!selectedProjectId) {
// //         setSelectedProjectDetails(null);
// //         setProjectDecomptes([]); // Reset decomptes
// //         return;
// //       }

// //       setLoading(true);
// //       setError(null);
// //       try {
// //         // Fetch Project Details
// //         const projectDocRef = doc(db, 'projects', selectedProjectId);
// //         const projectDocSnap = await getDoc(projectDocRef);
// //         if (projectDocSnap.exists()) {
// //           setSelectedProjectDetails({ id: projectDocSnap.id, ...projectDocSnap.data() });
// //         } else {
// //           setSelectedProjectDetails(null);
// //           setError("Détails du projet non trouvés.");
// //         }

// //         // Fetch Project Decomptes (assuming decomptes are in a separate collection, linked by projectId)
// //         const decomptesCollectionRef = collection(db, 'decomptes');
// //         const qDecomptes = query(decomptesCollectionRef, where("projectId", "==", selectedProjectId));
// //         const decomptesSnapshot = await getDocs(qDecomptes);
// //         const decomptesList = decomptesSnapshot.docs.map(doc => doc.data());
// //         setProjectDecomptes(decomptesList);

// //       } catch (err) {
// //         console.error("Error fetching selected project data:", err);
// //         setError("Impossible de charger les détails du projet. Veuillez réessayer.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchProjectData();
// //   }, [selectedProjectId]);

// //   if (loading && !selectedProjectId) {
// //     return <div className="import-page-container"><p>Chargement des projets...</p></div>;
// //   }

// //   if (error && !selectedProjectId) {
// //     return <div className="import-page-container error-message"><p>{error}</p></div>;
// //   }

// //   return (
// //     <div className="import-page-container">
// //       <h1 className="import-page-title">Importer un Projet</h1>

// //       <div className="project-selection-section">
// //         <label htmlFor="project-select">Sélectionner un Projet :</label>
// //         <select
// //           id="project-select"
// //           value={selectedProjectId}
// //           onChange={(e) => setSelectedProjectId(e.target.value)}
// //           className="project-select-dropdown"
// //         >
// //           <option value="">-- Choisissez un projet --</option>
// //           {projects.map((project) => (
// //             <option key={project.id} value={project.id}>
// //               {project.nomProjet} ({project.numProjet})
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {loading && selectedProjectId && <p className="loading-message">Chargement des détails du projet...</p>}
// //       {error && selectedProjectId && <p className="error-message">{error}</p>}

// //       {selectedProjectDetails && (
// //         <div className="project-details-section">
// //           <h2>Détails du Projet : {selectedProjectDetails.nomProjet}</h2>
// //           <div className="details-grid">
// //             <div className="detail-item">
// //               <strong>Numéro de Projet:</strong> {selectedProjectDetails.numProjet}
// //             </div>
// //             <div className="detail-item">
// //               <strong>Nom du Projet:</strong> {selectedProjectDetails.nomProjet}
// //             </div>
// //             <div className="detail-item">
// //               <strong>Banque:</strong> {selectedProjectDetails.bank}
// //             </div>
// //             <div className="detail-item">
// //               <strong>Budget:</strong> {selectedProjectDetails.budget} TND
// //             </div>
// //             <div className="detail-item">
// //               <strong>TVA:</strong> {selectedProjectDetails.tva}%
// //             </div>
// //             <div className="detail-item">
// //               <strong>Date d'Approbation:</strong> {selectedProjectDetails.dateApprobation}
// //             </div>
// //             <div className="detail-item">
// //               <strong>Date de Démarrage:</strong> {selectedProjectDetails.dateDemarrage}
// //             </div>
// //             <div className="detail-item">
// //               <strong>Date de Création:</strong> {selectedProjectDetails.createdAt ? new Date(selectedProjectDetails.createdAt).toLocaleDateString() : 'N/A'}
// //             </div>
// //             <div className="detail-item full-width">
// //               <strong>Description:</strong> {selectedProjectDetails.description || 'Non spécifiée'}
// //             </div>
// //              <div className="detail-item">
// //               {/* Assuming 'delais' is a simple string in projectData. Adjust if it's an object. */}
// //               <strong>Délai (info):</strong> {selectedProjectDetails.delais || 'Non spécifié'}
// //             </div>
// //           </div>

// //           <h3>Décomptes</h3>
// //           {projectDecomptes.length > 0 ? (
// //             <div className="decomptes-table-container">
// //               <table>
// //                 <thead>
// //                   <tr>
// //                     <th>N° Décompte</th>
// //                     <th>Montant</th>
// //                     <th>Date</th>
// //                     <th>Statut</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {projectDecomptes.map((decompte, index) => (
// //                     <tr key={index}>
// //                       <td>{decompte.decompteNumber}</td>
// //                       <td>{decompte.amount} TND</td>
// //                       <td>{decompte.date}</td>
// //                       <td>{decompte.status}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           ) : (
// //             <p>Aucun décompte trouvé pour ce projet.</p>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ImportProjectPage;


// import React, { useState, useEffect } from 'react';
// import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
// import { db } from '../../../firebase'
// import './ImportProjectPage.css';

// const ImportProjectPage = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState('');
//   const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
//   const [projectWorkStoppages, setProjectWorkStoppages] = useState([]);
//   const [projectDecomptes, setProjectDecomptes] = useState([]);
//   const [selectedDecompte, setSelectedDecompte] = useState(null); // New state for selected decompte
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         setLoading(true);
//         const projectsCollectionRef = collection(db, 'projects');
//         const projectSnapshot = await getDocs(projectsCollectionRef);
//         const projectsList = projectSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProjects(projectsList);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching projects:", err);
//         setError("Impossible de charger les projets. Veuillez réessayer.");
//         setLoading(false);
//       }
//     };

//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     const fetchProjectData = async () => {
//       if (!selectedProjectId) {
//         setSelectedProjectDetails(null);
//         setProjectWorkStoppages([]);
//         setProjectDecomptes([]);
//         setSelectedDecompte(null); 
//         return;
//       }

//       setLoading(true);
//       setError(null);
//       try {

//         const projectDocRef = doc(db, 'projects', selectedProjectId);
//         const projectDocSnap = await getDoc(projectDocRef);
//         if (projectDocSnap.exists()) {
//           setSelectedProjectDetails({ id: projectDocSnap.id, ...projectDocSnap.data() });
//         } else {
//           setSelectedProjectDetails(null);
//           setError("Détails du projet non trouvés.");
//         }

//         // Fetch Work Stoppages
//         const delaisCollectionRef = collection(db, 'deadlines');
//         const qDelais = query(delaisCollectionRef, where("projectId", "==", selectedProjectId));
//         const delaisSnapshot = await getDocs(qDelais);
//         if (!delaisSnapshot.empty && delaisSnapshot.docs[0].data().workStoppages) {
//           setProjectWorkStoppages(delaisSnapshot.docs[0].data().workStoppages);
//         } else {
//           setProjectWorkStoppages([]);
//         }

//         // Fetch Project Decomptes
//         const decomptesCollectionRef = collection(db, 'décomptes');
//         const qDecomptes = query(decomptesCollectionRef, where("projetId", "==", selectedProjectId));
//         const decomptesSnapshot = await getDocs(qDecomptes);
//         // Map data to include the document ID if needed, and ensure structure
//         const decomptesList = decomptesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setProjectDecomptes(decomptesList);
//         console.log(decomptesList)
//         setSelectedDecompte(null); // Clear selected decompte when project changes

//       } catch (err) {
//         console.error("Error fetching selected project data:", err);
//         setError("Impossible de charger les détails du projet. Veuillez réessayer.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProjectData();
//   }, [selectedProjectId]);

//   const handleDecompteClick = (decompte) => {
//     setSelectedDecompte(decompte);
//   };

//   if (loading && !selectedProjectId) {
//     return <div className="import-page-container"><p>Chargement des projets...</p></div>;
//   }

//   if (error && !selectedProjectId) {
//     return <div className="import-page-container error-message"><p>{error}</p></div>;
//   }

//   return (
//     <div className="import-page-container">
//       <h1 className="import-page-title">Importer un Projet</h1>

//       <div className="project-selection-section">
//         <label htmlFor="project-select">Sélectionner un Projet :</label>
//         <select
//           id="project-select"
//           value={selectedProjectId}
//           onChange={(e) => setSelectedProjectId(e.target.value)}
//           className="project-select-dropdown"
//         >
//           <option value="">-- Choisissez un projet --</option>
//           {projects.map((project) => (
//             <option key={project.id} value={project.id}>
//               {project.nomProjet} ({project.numProjet})
//             </option>
//           ))}
//         </select>
//       </div>

//       {loading && selectedProjectId && <p className="loading-message">Chargement des détails du projet...</p>}
//       {error && selectedProjectId && <p className="error-message">{error}</p>}

//       {selectedProjectDetails && (
//         <div className="project-details-section">
//           <h2>Détails du Projet : {selectedProjectDetails.nomProjet}</h2>
//           <div className="details-grid">
//             <div className="detail-item">
//               <strong>Numéro de Projet:</strong> {selectedProjectDetails.numProjet}
//             </div>
//             <div className="detail-item">
//               <strong>Nom du Projet:</strong> {selectedProjectDetails.nomProjet}
//             </div>
//             <div className="detail-item">
//               <strong>Banque:</strong> {selectedProjectDetails.bank}
//             </div>
//             <div className="detail-item">
//               <strong>Budget:</strong> {selectedProjectDetails.budget} TND
//             </div>
//             <div className="detail-item">
//               <strong>TVA:</strong> {selectedProjectDetails.tva}%
//             </div>
//             <div className="detail-item">
//               <strong>Date d'Approbation:</strong> {selectedProjectDetails.dateApprobation}
//             </div>
//             <div className="detail-item">
//               <strong>Date de Démarrage:</strong> {selectedProjectDetails.dateDemarrage}
//             </div>
//             <div className="detail-item">
//               <strong>Date de Création:</strong> {selectedProjectDetails.createdAt ? new Date(selectedProjectDetails.createdAt).toLocaleDateString() : 'N/A'}
//             </div>
//             <div className="detail-item full-width">
//               <strong>Description:</strong> {selectedProjectDetails.description || 'Non spécifiée'}
//             </div>
//             {selectedProjectDetails.delais && (
//               <div className="detail-item">
//                 <strong>Délai (information générale):</strong> {selectedProjectDetails.delais}
//               </div>
//             )}
//           </div>

//           <h3>Arrêts de Travail (Délais Détaillés)</h3>
//           {projectWorkStoppages.length > 0 ? (
//             <div className="work-stoppages-table-container">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Raison</th>
//                     <th>Date de Début</th>
//                     <th>Date de Fin</th>
//                     <th>Durée (jours)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {projectWorkStoppages.map((stoppage, index) => (
//                     <tr key={index}>
//                       <td>{stoppage.reason || 'N/A'}</td>
//                       <td>{stoppage.startDate || 'N/A'}</td>
//                       <td>{stoppage.endDate || 'N/A'}</td>
//                       <td>{stoppage.duration !== undefined ? stoppage.duration : 'N/A'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p>Aucun arrêt de travail détaillé trouvé pour ce projet.</p>
//           )}

//           <h3>Décomptes</h3>
//           {projectDecomptes.length > 0 ? (
//             <div className="decomptes-table-container">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>N°</th>
//                     <th>Mois</th>
//                     <th>Date Création</th>
//                     <th>TTC</th>
//                     <th>Action</th> {/* Added Action column */}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {projectDecomptes.map((decompte) => (
//                     <tr
//                       key={decompte.id}
//                       className={selectedDecompte?.id === decompte.id ? 'selected-row' : ''}
//                       onClick={() => handleDecompteClick(decompte)}
//                     >
//                       <td>{decompte.numero}</td>
//                       <td>{decompte.mois}</td>
//                       <td>{decompte.dateCréation ? new Date(decompte.dateCréation.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
//                       <td>{decompte.ttc} TND</td>
//                       <td>
//                         <button
//                           className="view-articles-button"
//                           onClick={(e) => {
//                             e.stopPropagation(); // Prevent row click from firing
//                             handleDecompteClick(decompte);
//                           }}
//                         >
//                           Voir Articles
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p>Aucun décompte trouvé pour ce projet.</p>
//           )}

//           {/* New Section for ArticlesDecompte */}
//           {selectedDecompte && selectedDecompte.ArticlesDecompte && selectedDecompte.ArticlesDecompte.length > 0 && (
//             <div className="articles-decompte-section">
//               <h3>Articles du Décompte N° {selectedDecompte.numero} ({selectedDecompte.mois})</h3>
//               <div className="articles-decompte-table-container">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>N° Article</th>
//                       <th>Désignation</th>
//                       <th>Unité</th>
//                       <th>Quantité Marché</th>
//                       <th>Quantité Réalisée</th>
//                       <th>Pourcentage Réalisation</th>
//                       <th>Prix Unitaire</th>
//                       <th>Taux TVA</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedDecompte.ArticlesDecompte.map((article, index) => (
//                       <tr key={index}>
//                         <td>{article.articleId || 'N/A'}</td>
//                         <td>{article.designation || 'N/A'}</td>
//                         <td>{article.unite || 'N/A'}</td>
//                         <td>{article.quantitéMarché !== undefined ? article.quantitéMarché : 'N/A'}</td>
//                         <td>{article.quantitéRéalisée !== undefined ? article.quantitéRéalisée : 'N/A'}</td>
//                         <td>{(article.pourcentageRéalisation !== undefined ? article.pourcentageRéalisation : 'N/A')}%</td>
//                         <td>{article.prixUnitaire !== undefined ? article.prixUnitaire : 'N/A'} TND</td>
//                         <td>{(article.tvaRate !== undefined ? article.tvaRate : 'N/A')}%</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {selectedDecompte && (!selectedDecompte.ArticlesDecompte || selectedDecompte.ArticlesDecompte.length === 0) && (
//             <p className="no-articles-message">Aucun article trouvé pour ce décompte.</p>
//           )}

//         </div>
//       )}
//     </div>
//   );
// };

// export default ImportProjectPage;


// src/components/ImportProjectPage/ImportProjectPage.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust path to your firebase-config
import './ImportProjectPage.css';

const ImportProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [projectWorkStoppages, setProjectWorkStoppages] = useState([]);
  const [projectDecomptes, setProjectDecomptes] = useState([]);
  const [selectedDecompte, setSelectedDecompte] = useState(null);
  const [articlesDecompte, setArticlesDecompte] = useState([]); // New state for articles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingArticles, setLoadingArticles] = useState(false); // New loading state for articles
  const [articlesError, setArticlesError] = useState(null); // New error state for articles

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsCollectionRef = collection(db, 'projects');
        const projectSnapshot = await getDocs(projectsCollectionRef);
        const projectsList = projectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Impossible de charger les projets. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!selectedProjectId) {
        setSelectedProjectDetails(null);
        setProjectWorkStoppages([]);
        setProjectDecomptes([]);
        setSelectedDecompte(null);
        setArticlesDecompte([]); // Clear articles
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch Project Details
        const projectDocRef = doc(db, 'projects', selectedProjectId);
        const projectDocSnap = await getDoc(projectDocRef);
        if (projectDocSnap.exists()) {
          setSelectedProjectDetails({ id: projectDocSnap.id, ...projectDocSnap.data() });
        } else {
          setSelectedProjectDetails(null);
          setError("Détails du projet non trouvés.");
        }

        // Fetch Work Stoppages
        const delaisCollectionRef = collection(db, 'deadlines');
        const qDelais = query(delaisCollectionRef, where("projectId", "==", selectedProjectId));
        const delaisSnapshot = await getDocs(qDelais);
        if (!delaisSnapshot.empty && delaisSnapshot.docs[0].data().workStoppages) {
          setProjectWorkStoppages(delaisSnapshot.docs[0].data().workStoppages);
        } else {
          setProjectWorkStoppages([]);
        }

        // Fetch Project Decomptes
        const decomptesCollectionRef = collection(db, 'décomptes');
        const qDecomptes = query(decomptesCollectionRef, where("projetId", "==", selectedProjectId));
        const decomptesSnapshot = await getDocs(qDecomptes);
        const decomptesList = decomptesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjectDecomptes(decomptesList);
        setSelectedDecompte(null); // Clear selected decompte when project changes
        setArticlesDecompte([]); // Clear articles when project changes

      } catch (err) {
        console.error("Error fetching selected project data:", err);
        setError("Impossible de charger les détails du projet. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [selectedProjectId]);


  const handleDecompteClick = async (decompte) => {
    // If the same decompte is clicked again, collapse the articles
    if (selectedDecompte?.id === decompte.id) {
      setSelectedDecompte(null);
      setArticlesDecompte([]);
      return;
    }

    setSelectedDecompte(decompte);
    setLoadingArticles(true);
    setArticlesError(null);
    setArticlesDecompte([]); // Clear previous articles

    try {
      // THIS IS THE CRUCIAL CHANGE: Fetching from a sub-collection
      const articlesSubcollectionRef = collection(db, 'décomptes', decompte.id, 'ArticlesDecompte'); // Pointing to sub-collection
      const articlesSnapshot = await getDocs(articlesSubcollectionRef);
      const articlesList = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log("Fetched ArticlesDecompte for decompte:", decompte.id, articlesList); // Debug log

      setArticlesDecompte(articlesList);
    } catch (err) {
      console.error("Error fetching articles for decompte:", decompte.id, err);
      setArticlesError("Impossible de charger les articles de ce décompte.");
    } finally {
      setLoadingArticles(false);
    }
  };


  if (loading && !selectedProjectId) {
    return <div className="import-page-container"><p>Chargement des projets...</p></div>;
  }

  if (error && !selectedProjectId) {
    return <div className="import-page-container error-message"><p>{error}</p></div>;
  }

  return (
    <div className="import-page-container">
      <h1 className="import-page-title">Importer un Projet</h1>

      <div className="project-selection-section">
        <label htmlFor="project-select">Sélectionner un Projet :</label>
        <select
          id="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="project-select-dropdown"
        >
          <option value="">-- Choisissez un projet --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.nomProjet} ({project.numProjet})
            </option>
          ))}
        </select>
      </div>

      {loading && selectedProjectId && <p className="loading-message">Chargement des détails du projet...</p>}
      {error && selectedProjectId && <p className="error-message">{error}</p>}

      {selectedProjectDetails && (
        <div className="project-details-section">
          <h2>Détails du Projet : {selectedProjectDetails.nomProjet}</h2>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Numéro de Projet:</strong> {selectedProjectDetails.numProjet}
            </div>
            <div className="detail-item">
              <strong>Nom du Projet:</strong> {selectedProjectDetails.nomProjet}
            </div>
            <div className="detail-item">
              <strong>Banque:</strong> {selectedProjectDetails.bank}
            </div>
            <div className="detail-item">
              <strong>Budget:</strong> {selectedProjectDetails.budget} TND
            </div>
            <div className="detail-item">
              <strong>TVA:</strong> {selectedProjectDetails.tva}%
            </div>
            <div className="detail-item">
              <strong>Date d'Approbation:</strong> {selectedProjectDetails.dateApprobation}
            </div>
            <div className="detail-item">
              <strong>Date de Démarrage:</strong> {selectedProjectDetails.dateDemarrage}
            </div>
            <div className="detail-item">
              <strong>Date de Création:</strong> {selectedProjectDetails.createdAt ? new Date(selectedProjectDetails.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="detail-item full-width">
              <strong>Description:</strong> {selectedProjectDetails.description || 'Non spécifiée'}
            </div>
            {selectedProjectDetails.delais && (
              <div className="detail-item">
                <strong>Délai (information générale):</strong> {selectedProjectDetails.delais}
              </div>
            )}
          </div>

          <h3>Arrêts de Travail (Délais Détaillés)</h3>
          {projectWorkStoppages.length > 0 ? (
            <div className="work-stoppages-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Raison</th>
                    <th>Date de Début</th>
                    <th>Date de Fin</th>
                    <th>Durée (jours)</th>
                  </tr>
                </thead>
                <tbody>
                  {projectWorkStoppages.map((stoppage, index) => (
                    <tr key={index}>
                      <td>{stoppage.reason || 'N/A'}</td>
                      <td>{stoppage.startDate || 'N/A'}</td>
                      <td>{stoppage.endDate || 'N/A'}</td>
                      <td>{stoppage.duration !== undefined ? stoppage.duration : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucun arrêt de travail détaillé trouvé pour ce projet.</p>
          )}

          <h3>Décomptes</h3>
          {projectDecomptes.length > 0 ? (
            <div className="decomptes-table-container">
              <table>
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Mois</th>
                    <th>Date Création</th>
                    <th>TTC</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projectDecomptes.map((decompte) => (
                    <tr
                      key={decompte.id}
                      className={selectedDecompte?.id === decompte.id ? 'selected-row' : ''}
                      onClick={() => handleDecompteClick(decompte)} // Row click also triggers fetch
                    >
                      <td>{decompte.numero}</td>
                      <td>{decompte.mois}</td>
                      <td>{decompte.dateCréation ? new Date(decompte.dateCréation.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                      <td>{decompte.ttc} TND</td>
                      <td>
                        <button
                          className="view-articles-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from firing twice
                            handleDecompteClick(decompte);
                          }}
                        >
                          {selectedDecompte?.id === decompte.id ? 'Masquer Articles' : 'Voir Articles'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucun décompte trouvé pour ce projet.</p>
          )}

          {/* New Section for ArticlesDecompte */}
          {loadingArticles && <p className="loading-message">Chargement des articles...</p>}
          {articlesError && <p className="error-message">{articlesError}</p>}

          {selectedDecompte && articlesDecompte.length > 0 && !loadingArticles && ( // Removed selectedDecompte.ArticlesDecompte check
            <div className="articles-decompte-section">
              <h3>Articles du Décompte N° {selectedDecompte.numero} ({selectedDecompte.mois})</h3>
              <div className="articles-decompte-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>N° Article</th>
                      <th>Désignation</th>
                      <th>Unité</th>
                      <th>Quantité Marché</th>
                      <th>Quantité Réalisée</th>
                      <th>% Réalisation</th>
                      <th>Prix Unitaire</th>
                      <th>Taux TVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articlesDecompte.map((article, index) => (
                      <tr key={index}>
                        <td>{article.articleNumber || 'N/A'}</td>
                        <td>{article.designation || 'N/A'}</td>
                        <td>{article.unite || 'N/A'}</td>
                        <td>{article.quantitéMarché !== undefined ? article.quantitéMarché : 'N/A'}</td>
                        <td>{article.quantitéRéalisée !== undefined ? article.quantitéRéalisée : 'N/A'}</td>
                        <td>{(article.pourcentageRéalisation !== undefined ? article.pourcentageRéalisation : 'N/A')}%</td>
                        <td>{article.prixUnitaire !== undefined ? article.prixUnitaire : 'N/A'} TND</td>
                        <td>{(article.tvaRate !== undefined ? article.tvaRate : 'N/A')}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedDecompte && !loadingArticles && articlesDecompte.length === 0 && !articlesError && (
            <p className="no-articles-message">Aucun article trouvé pour ce décompte.</p>
          )}

        </div>
      )}
    </div>
  );
};

export default ImportProjectPage;