// import React, { useState, useEffect } from 'react';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../../../../firebase';
// import styles from './TableauComparatif.module.css';

// const TableauComparatifProjet = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState('');
//   const [articles, setArticles] = useState([]);
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [loadingArticles, setLoadingArticles] = useState(false);
//   const [error, setError] = useState(null);

//   // Charger la liste des projets
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         setLoadingProjects(true);
//         const projectsSnapshot = await getDocs(collection(db, 'projects'));
//         const projectsData = projectsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProjects(projectsData);
//         setLoadingProjects(false);
//       } catch (err) {
//         console.error("Erreur de chargement des projets:", err);
//         setError("Erreur de chargement des projets");
//         setLoadingProjects(false);
//       }
//     };

//     fetchProjects();
//   }, []);

//   // Charger les articles quand un projet est sélectionné
//   useEffect(() => {
//     const fetchArticles = async () => {
//       if (!selectedProjectId) return;

//       try {
//         setLoadingArticles(true);
//         setArticles([]);
        
//         // 1. Récupérer les articles du projet
//         const articlesQuery = query(
//           collection(db, 'articlesProjet'),
//           where('projectId', '==', selectedProjectId)
//         );
//         const articlesSnapshot = await getDocs(articlesQuery);
//         const articlesData = articlesSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));

//         // 2. Pour chaque article, récupérer les quantités réalisées
//         const articlesWithQuantities = await Promise.all(
//           articlesData.map(async article => {
//             const decomptesQuery = query(
//               collection(db, 'ArticlesDecompte'),
//               where('articleId', '==', article.id),
//               where('projetId', '==', selectedProjectId)
//             );
//             const snapshot = await getDocs(decomptesQuery);
//              console.log(`Décomptes trouvés pour l'article ${article.id}:`, snapshot.size);
            
//             let quantiteRealisee = 0;
//       snapshot.forEach(doc => {
//         console.log('Document décompte:', doc.id, doc.data()); // Debug
//         const qte = doc.data().quantitéRéalisée;
//         if (typeof qte === 'number') {
//           quantiteRealisee += qte;
//         }
//       });

//       console.log(`Quantité réalisée pour ${article.id}:`, quantiteRealisee);

//             const tauxAvancement = article.quantity > 0 
//               ? (quantiteRealisee / article.quantity) * 100 
//               : 0;

//             return {
//               ...article,
//               quantiteRealisee,
//               tauxAvancement,
//               resteARealiser: article.quantity - quantiteRealisee
//             };
//           })
//         );

//         setArticles(articlesWithQuantities);
//         setLoadingArticles(false);
//       } catch (err) {
//         console.error("Erreur de chargement des articles:", err);
//         setError("Erreur de chargement des données du projet");
//         setLoadingArticles(false);
//       }
//     };

//     fetchArticles();
//   }, [selectedProjectId]);

//   const handleProjectChange = (e) => {
//     setSelectedProjectId(e.target.value);
//   };

//   const selectedProject = projects.find(p => p.id === selectedProjectId) || {};

//   return (
//     <div className={styles.container}>
//       <h1>Tableau Comparatif par Projet</h1>

//       {/* Sélection du projet */}
//       <div className={styles.projectSelector}>
//         <label htmlFor="project-select">Sélectionnez un projet :</label>
//         <select
//           id="project-select"
//           value={selectedProjectId}
//           onChange={handleProjectChange}
//           disabled={loadingProjects}
//           className={styles.select}
//         >
//           <option value="">-- Choisir un projet --</option>
//           {projects.map(project => (
//             <option key={project.id} value={project.id}>
//               {project.numProjet} - {project.nomProjet|| 'Sans nom'}
//             </option>
//           ))}
//         </select>
//       </div>

//       {loadingProjects && (
//         <div className={styles.loading}>Chargement des projets...</div>
//       )}

//       {error && (
//         <div className={styles.error}>{error}</div>
//       )}

//       {/* Affichage des résultats */}
//       {selectedProjectId && (
//         <>
//           <div className={styles.projectHeader}>
//             <h2>{selectedProject.numProjet} - {selectedProject.name}</h2>
//             {selectedProject.description && (
//               <p className={styles.projectDescription}>{selectedProject.description}</p>
//             )}
//           </div>

//           {loadingArticles ? (
//             <div className={styles.loading}>Chargement des articles...</div>
//           ) : articles.length === 0 ? (
//             <div className={styles.noData}>Aucun article trouvé pour ce projet</div>
//           ) : (
//             <>
//               <div className={styles.summaryCards}>
//                 <div className={styles.summaryCard}>
//                   <h3>Avancement Global</h3>
//                   <div className={styles.globalProgress}>
//                     <div className={styles.progressCircle}>
//                       {Math.round(
//                         articles.reduce((sum, a) => sum + a.tauxAvancement, 0) / 
//                         articles.length
//                       )}%
//                     </div>
//                     <div className={styles.progressLegend}>
//                       <span>Articles: {articles.length}</span>
//                       <span>Complétés: {
//                         articles.filter(a => a.tauxAvancement >= 100).length
//                       }</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className={styles.summaryCard}>
//                   <h3>Quantités Totales</h3>
//                   <div className={styles.quantitiesSummary}>
//                     <div>
//                       <span>Marché:</span>
//                       <strong>{
//                         articles.reduce((sum, a) => sum + a.quantity, 0).toLocaleString()
//                       }</strong>
//                     </div>
//                     <div>
//                       <span>Réalisé:</span>
//                       <strong>{
//                         articles.reduce((sum, a) => sum + a.quantiteRealisee, 0).toLocaleString()
//                       }</strong>
//                     </div>
//                     <div>
//                       <span>Reste:</span>
//                       <strong className={styles.remaining}>{
//                         articles.reduce((sum, a) => sum + a.resteARealiser, 0).toLocaleString()
//                       }</strong>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className={styles.tableWrapper}>
//                 <table className={styles.comparisonTable}>
//                   <thead>
//                     <tr>
//                       <th>Article</th>
//                       <th>Désignation</th>
//                       <th>Unité</th>
//                       <th>Qté Marché</th>
//                       <th>Qté Réalisée</th>
//                       <th>Reste</th>
//                       <th>Avancement</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {articles.map(article => (
//                       <tr key={article.id}>
//                         <td>{article.articleNumber}</td>
//                         <td>{article.designation}</td>
//                         <td>{article.unite}</td>
//                         <td>{article.quantity.toLocaleString()}</td>
//                         <td>{article.quantiteRealisee.toLocaleString()}</td>
//                         <td className={
//                           article.resteARealiser > 0 ? styles.warning : styles.success
//                         }>
//                           {article.resteARealiser.toLocaleString()}
//                         </td>
//                         <td>
//                           <div className={styles.progressContainer}>
//                             <div 
//                               className={styles.progressBar}
//                               style={{ width: `${Math.min(100, article.tauxAvancement)}%` }}
//                             ></div>
//                             <span>{article.tauxAvancement.toFixed(1)}%</span>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default TableauComparatifProjet;
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import styles from './TableauComparatif.module.css';

const TableauComparatifProjet = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [articles, setArticles] = useState([]);
  const [decomptes, setDecomptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la liste des projets
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        setProjects(projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Erreur de chargement des projets");
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  // Charger les décomptes et articles quand un projet est sélectionné
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProjectId) return;

      try {
        setLoading(true);
        
        // 1. Charger tous les décomptes du projet
        const decomptesQuery = query(
          collection(db, 'décomptes'),
          where('projetId', '==', selectedProjectId)
        );
        const decomptesSnapshot = await getDocs(decomptesQuery);
        const decomptesData = decomptesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDecomptes(decomptesData);

        // 2. Charger tous les articles de tous les décomptes
        const allArticles = [];
        for (const decompte of decomptesData) {
          const articlesRef = collection(db, 'décomptes', decompte.id, 'ArticlesDecompte');
          const articlesSnapshot = await getDocs(articlesRef);
          articlesSnapshot.forEach(doc => {
            allArticles.push({
              decompteId: decompte.id,
              ...doc.data()
            });
          });
        }

        // 3. Calculer les cumuls par article
        const articlesMap = new Map();
        
        allArticles.forEach(article => {
          if (!articlesMap.has(article.articleId)) {
            articlesMap.set(article.articleId, {
              articleId: article.articleId,
              articleNumber: article.articleNumber,
              designation: article.designation,
              unite: article.unite,
              quantitéMarché: article.quantitéMarché,
              prixUnitaire: article.prixUnitaire,
              quantiteRealisee: 0,
              decomptes: []
            });
          }
          const existing = articlesMap.get(article.articleId);
          articlesMap.set(article.articleId, {
            ...existing,
            quantiteRealisee: existing.quantiteRealisee + (article.quantitéRéalisée || 0),
            decomptes: [...existing.decomptes, {
              decompteId: article.decompteId,
              quantité: article.quantitéRéalisée,
              date: article.date?.toDate() || new Date()
            }]
          });
        });

        // 4. Calculer les taux d'avancement
        const processedArticles = Array.from(articlesMap.values()).map(article => ({
          ...article,
          tauxAvancement: article.quantitéMarché > 0 
            ? (article.quantiteRealisee / article.quantitéMarché) * 100 
            : 0,
          resteARealiser: article.quantitéMarché - article.quantiteRealisee
        }));

        setArticles(processedArticles);
      } catch (err) {
        setError("Erreur de chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjectId]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || {};

  return (
    <div className={styles.container}>
      <h1>Tableau Comparatif des Décomptes</h1>

      {/* Sélection du projet */}
      <div className={styles.projectSelector}>
        <label>Sélectionnez un projet :</label>
        <select 
          value={selectedProjectId} 
          onChange={handleProjectChange}
          className={styles.select}
        >
          <option value="">-- Choisir un projet --</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.numProjet} - {project.nomProjet}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className={styles.loading}>Chargement...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Résultats */}
      {selectedProjectId && !loading && (
        <>
          <div className={styles.projectHeader}>
            <h2>{selectedProject.numProjet} - {selectedProject.nomProjet}</h2>
            <p>Total décomptes: {decomptes.length}</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Désignation</th>
                  <th>Qté Marché</th>
                  <th>Qté Réalisée</th>
                  <th>Reste</th>
                  <th>Avancement</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.articleId}>
                    <td>{article.articleNumber}</td>
                    <td>{article.designation}</td>
                    <td>{article.quantitéMarché}</td>
                    <td>{article.quantiteRealisee}</td>
                    <td className={
                      article.resteARealiser > 0 ? styles.warning : styles.success
                    }>
                      {article.resteARealiser}
                    </td>
                    <td>
                      <div className={styles.progressContainer}>
                        <div 
                          className={styles.progressBar}
                          style={{ width: `${Math.min(100, article.tauxAvancement)}%` }}
                        />
                        <span>{article.tauxAvancement.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.decompteDetails}>
            <h3>Détail par Décompte</h3>
            {decomptes.map(decompte => (
              <div key={decompte.id} className={styles.decompteCard}>
                <h4>Décompte {decompte.numero} - {decompte.mois}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Qté Réalisée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles
                      .filter(a => a.decomptes.some(d => d.decompteId === decompte.id))
                      .map(article => {
                        const decompteArt = article.decomptes.find(d => d.decompteId === decompte.id);
                        return (
                          <tr key={`${decompte.id}-${article.articleId}`}>
                            <td>{article.articleNumber} - {article.designation}</td>
                            <td>{decompteArt.quantité}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}



      
    </div>
  );
};

export default TableauComparatifProjet;