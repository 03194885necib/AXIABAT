
// import React, { useEffect, useState } from 'react';
// import SelectInput from './SelectInput';
// import { db } from "../../firebase";
// import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
// import './Test2.css';
// import { useNavigate } from 'react-router-dom';
// import {
//   FormGroup, Button, ButtonRow2, ButtonRow, FormLabel, ModalFormGrid,
//   FormGrid, Container, Card, Header, HeaderLeft, Subtitle, HeaderRight, Title, TabContainer,
//   FormInput, DatesGrid, CloseButton, ModalContent, DateLabel, Modal, DateInput, TabContent, DateGroup, SelectedArticlesSection
// } from '../Styled';
// import ListeArticle from './ListeArticle/ListeArticle';

// const TenderCard = () => {
//   const [activeTab, setActiveTab] = useState('dates');
//   const [categories, setCategories] = useState([]);
//   const [listeArticle, setListeArticles] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [articleCategorie, setArticleCategorie] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentArticleToModify, setCurrentArticleToModify] = useState(null);
//   const [showSelectedArticles, setShowSelectedArticles] = useState(false);
//   const [selectedArticles, setSelectedArticles] = useState([]);
//   const [selectedArticlesTable, setSelectedArticlesTable] = useState([]);

//   const navigate = useNavigate();

//   const handleCardClick = (route) => {
//     navigate(route);
//   };



// const handleArticleTableUpdate = (updatedArticles) => {
//   const currentArticlesString = JSON.stringify(selectedArticlesTable);
//   const newArticlesString = JSON.stringify(updatedArticles.map(article => ({
//     articleNumber: article.articleNumber,
//     designation: article.designation,
//     quantity: parseFloat(article.quantity) || 0,
//     unitPrice: parseFloat(article.unitPrice) || 0,
//     tvaRate: parseFloat(article.tvaRate) || 0,
//     unite: article.unite,
//     id: article.id
//   })));

//   if (currentArticlesString !== newArticlesString) {
//     setSelectedArticlesTable(updatedArticles.map(article => ({
//       articleNumber: article.articleNumber,
//       designation: article.designation,
//       quantity: parseFloat(article.quantity) || 0,
//       unitPrice: parseFloat(article.unitPrice) || 0,
//       tvaRate: parseFloat(article.tvaRate) || 0,
//       unite: article.unite,
//       id: article.id
//     })));
//   }
// };
//   const handleSaveProjetEtArticles = async () => {
//     const numProjet = document.getElementById('numProjet').value.trim();
//     const description = document.getElementById('description').value.trim();
//     const delais = document.getElementById('Delais').value.trim();
//     const budget = document.getElementById('Budget').value.trim();
//     const bank = document.getElementById('bank').value.trim();
//     const dateApprobation = document.getElementById('dateApprobation').value;
//     const dateDemarrage = document.getElementById('dateDemarrage').value;

//     if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage || !delais || !budget) {
//       alert('Veuillez remplir tous les champs du projet.');
//       return;
//     }

//     for (let i = 0; i < selectedArticlesTable.length; i++) {
//       const article = selectedArticlesTable[i];
//       const {
//         articleNumber,
//         designation,
//         quantity,
//         unitPrice,
//         tvaRate,
//       } = article;

//       if (
//         !articleNumber ||
//         !designation ||
//         isNaN(quantity) ||
//         isNaN(unitPrice) ||
//         isNaN(tvaRate)
//       ) {
//         alert(`Veuillez remplir correctement tous les champs de l'article ${i + 1}`);
//         return;
//       }
//     }

//     try {
//       const projetRef = await addDoc(collection(db, "projets"), {
//         numProjet,
//         description,
//         bank,
//         delais,
//         budget,
//         dateApprobation,
//         dateDemarrage,
//         createdAt: new Date().toISOString(),
//       });

//       const projetId = projetRef.id;

//       const articlesPromises = selectedArticlesTable.map((article) =>
//         addDoc(collection(db, "projets", projetId, "ArticlesProjet"), {
//           articleNumber: article.articleNumber,
//           designation: article.designation,
//           quantity: parseFloat(article.quantity),
//           unitPrice: parseFloat(article.unitPrice),
//           tvaRate: parseFloat(article.tvaRate),
//           unite: article.unite,
//         })
//       );
//       await Promise.all(articlesPromises);

//       alert("Projet et articles sauvegardés avec succès !");
//     } catch (error) {
//       console.error("Erreur lors de la sauvegarde :", error);
//       alert("Une erreur est survenue !");
//     }
//   };

//   const addProjectToFirebase = async (projectData) => {
//     try {
//       const docRef = await addDoc(collection(db, 'projects'), projectData);
//       return docRef.id;
//     } catch (error) {
//       console.error('Erreur lors de l’ajout du projet :', error);
//       throw error;
//     }
//   };

//   const addArticlesToFirebase = async (articles, projectId) => {
//     const articlesRef = collection(db, 'articlesProjet');

//     try {
//       const batchPromises = articles.map(article => {
//         return addDoc(articlesRef, {
//           ...article,
//           projectId: projectId,
//         });
//       });

//       await Promise.all(batchPromises);
//       console.log('Tous les articles ont été ajoutés.');
//     } catch (error) {
//       console.error('Erreur lors de l’ajout des articles :', error);
//     }
//   };
//   const handleSaveProjet = async () => {
//     const numProjet = document.getElementById('numProjet').value.trim();
//     const description = document.getElementById('description').value.trim();
//     const delais = document.getElementById('Delais').value.trim();
//     const budget = document.getElementById('Budget').value.trim();
//     const bank = document.getElementById('bank').value.trim();
//     const dateApprobation = document.getElementById('dateApprobation').value;
//     const dateDemarrage = document.getElementById('dateDemarrage').value;

//     if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage || !delais || !budget) {
//       alert('Veuillez remplir tous les champs du projet.');
//       return;
//     }

//     if (selectedArticlesTable.length === 0) {
//       alert('Veuillez sélectionner au moins un article.');
//       return;
//     }

//     // Validation des articles directement depuis l'état local
//     const areArticlesValid = selectedArticlesTable.every(article =>
//       article.articleNumber &&
//       article.designation &&
//       !isNaN(article.quantity) &&
//       !isNaN(article.unitPrice) &&
//       !isNaN(article.tvaRate) &&
//       article.unite
//     );

//     if (!areArticlesValid) {
//       alert('Veuillez remplir correctement tous les champs de tous les articles sélectionnés.');
//       return;
//     }

//     const projectData = {
//       numProjet,
//       description,
//       bank,
//       delais,
//       budget,
//       dateApprobation,
//       dateDemarrage,
//       createdAt: new Date().toISOString(),
//     };

//     try {
//       const projectId = await addProjectToFirebase(projectData);
//       console.log(projectId);
//       const articlesToSave = selectedArticlesTable.map(article => ({
//         articleNumber: article.articleNumber,
//         designation: article.designation,
//         quantity: parseFloat(article.quantity),
//         unitPrice: parseFloat(article.unitPrice),
//         tvaRate: parseFloat(article.tvaRate),
//         unite: article.unite,
//         projectId: projectId, // Ajouter l'ID du projet à chaque article
//       }));
//       await addArticlesToFirebase(articlesToSave, projectId);
//       alert('Projet et articles ajoutés avec succès !');
//       // Optionnel : vider les champs ou rediriger l’utilisateur
//     } catch (error) {
//       alert("Une erreur est survenue lors de l'enregistrement.");
//     }
//   };

//   const validateSelectedArticles = () => {
//     return selectedArticlesTable.every(article =>
//       article.articleNumber &&
//       article.designation &&
//       !isNaN(article.quantity) &&
//       !isNaN(article.unitPrice) &&
//       !isNaN(article.tvaRate) &&
//       article.unite
//     );
//   };

//   const [newArticleProjet, setNewArticleProjet] = useState({
//     numero: '',
//     designation: '',
//     quantite: '',
//     prix: '',
//     tva: '',
//     unite: ''
//   });

//   // Fonction pour gérer les changements dans le formulaire de nouvel article
//   const handleNewArticleChange = (e) => {
//     const { name, value } = e.target;
//     setNewArticleProjet(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
//   // Fonction pour sauvegarder le nouvel article de projet
//   const handleSaveNewArticleProjet = async () => {
//     try {
//       // Ajouter la logique pour sauvegarder dans Firestore
//       const newArticleRef = await addDoc(collection(db, 'articlesProjets'), {
//         ...newArticleProjet,
//         articleOriginalId: currentArticleToModify.id,
//         dateCreation: new Date()
//       });

//       // Mettre à jour la liste des articles sélectionnés
//       const updatedArticle = {
//         ...currentArticleToModify,
//         ...newArticleProjet,
//         projetArticleId: newArticleRef.id
//       }; // Mise à jour des états
//       setSelectedArticlesTable(prev =>
//         prev.map(article =>
//           article.id === currentArticleToModify.id ? updatedArticle : article
//         )
//       );

//       // Fermer le modal
//       setIsModalOpen(false);

//       // Réinitialiser le formulaire
//       setNewArticleProjet({
//         numero: '',
//         designation: '',
//         quantite: '',
//         prix: '',
//         tva: '',
//         unite: ''
//       });
//     } catch (error) {
//       console.error("Erreur lors de la sauvegarde de l'article:", error);
//     }
//   };

//   // Charger les catégories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const querySnapshot = await getDocs(collection(db, 'categories'));
//       const cats = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         name: doc.data().designation || `Catégorie ${doc.id}`
//       }));
//       setCategories(cats);
//     };
//     fetchCategories();
//   }, []);

//   // Charger tous les articles (seulement pour obtenir les ids et catégories)
//   useEffect(() => {
//     const fetchArticles = async () => {
//       const snapShot = await getDocs(collection(db, 'articles'));
//       const articles = snapShot.docs.map(doc => ({
//         id: doc.id,
//         designation: doc.data().designation || '',
//         numero: doc.data().numero || '',
//         unite: doc.data().unite || '',
//         categorie: doc.data().categorie || `article ${doc.id}`
//       }));
//       setListeArticles(articles);
//       setLoading(false);
//     };
//     fetchArticles();
//   }, []);

//   // Charger les articles pour la catégorie sélectionnée
//   useEffect(() => {
//     const fetchArticleByID = async (id) => {
//       const docRef = doc(db, "articles", id);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         return { id: docSnap.id, ...docSnap.data() };
//       }
//       return null;
//     };

//     const loadArticlesForCategory = async () => {
//       if (!selectedCategory) return;
//       const filtered = listeArticle.filter(article => article.categorie === selectedCategory);
//       const articlesDetails = await Promise.all(filtered.map(a => fetchArticleByID(a.id)));
//       setArticleCategorie(articlesDetails.filter(Boolean));
//     };

//     loadArticlesForCategory();
//   }, [selectedCategory, listeArticle]);

//   // Fonction pour gérer la sélection/désélection des articles
//   const handleArticleSelect = (article) => {
//     const isAlreadySelected = selectedArticles.some(a => a.id === article.id);

//     if (isAlreadySelected) {
//       setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
//       setSelectedArticlesTable(selectedArticlesTable.filter(a => a.id !== article.id));
//     } else {
//       setSelectedArticles([...selectedArticles, article]);
//       setSelectedArticlesTable([...selectedArticlesTable, article]);
//     }
//   };

//   return (
//     <Container>
//       <Card>
//         <Header>
//           <HeaderLeft>
//             <Subtitle>GC_E01</Subtitle>
//           </HeaderLeft>
//           <HeaderRight>
//             <Title>Carte de transaction</Title>
//             <Subtitle>Direction générale de l'ingénierie, chef du service des travaux publics 3</Subtitle>
//           </HeaderRight>
//         </Header>

//         <FormGrid>
//           <FormGroup>
//             <FormLabel htmlFor="tenderNumber">n° Projet </FormLabel>
//             <FormInput type="text" id="numProjet" placeholder="2024036" />
//           </FormGroup>

//           <FormGroup>
//             <FormLabel htmlFor="subject">Description</FormLabel>
//             <FormInput type="text" id="description" placeholder="Description du projet" />
//           </FormGroup>

//           <FormGroup>
//             <FormLabel htmlFor="bank">Banque</FormLabel>
//             <FormInput type="text" id="bank" placeholder="Banque" />
//           </FormGroup>
//           <FormGroup>
//             <FormLabel htmlFor="bank">Delais</FormLabel>
//             <FormInput type="text" id="Delais" placeholder="Delais" />
//           </FormGroup>
//           <FormGroup>
//             <FormLabel htmlFor="bank">Budget</FormLabel>
//             <FormInput type="text" id="Budget" placeholder="Budget" />
//           </FormGroup>
//         </FormGrid>

//         <TabContainer>
//           <ButtonRow>
//             <Button onClick={() => setActiveTab('dates')} className={activeTab === 'dates' ? 'active' : ''}>
//               Dates
//             </Button>
//             <Button onClick={() => setActiveTab('articles')} className={activeTab === 'articles' ? 'active' : ''}>
//               Articles
//             </Button>
//           </ButtonRow>

//           <TabContent className={activeTab === 'dates' ? '' : 'hidden'}>
//             <DatesGrid>
//               <DateGroup>
//                 <DateLabel htmlFor="announcementDate">Date d'approbation</DateLabel>
//                 <DateInput type="date" id="dateApprobation" />
//               </DateGroup>
//               <DateGroup>
//                 <DateLabel htmlFor="bidDeadline">Date de démarrage</DateLabel>
//                 <DateInput type="date" id="dateDemarrage" />
//               </DateGroup>
//             </DatesGrid>
//           </TabContent>

//           <TabContent className={activeTab === 'articles' ? '' : 'hidden'}>
//             <DatesGrid>
//               <DateGroup>
//                 <DateLabel htmlFor="categorie">Catégorie</DateLabel>
//                 <SelectInput
//                   id="categorie"
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   options={categories.map(cat => ({
//                     value: cat.id,
//                     label: cat.name
//                   }))}
//                 />
//               </DateGroup>
//             </DatesGrid>

//             {selectedCategory && articleCategorie.length > 0 ? (
//               <table className="article-table">
//                 <thead>
//                   <tr>
//                     <th>Sélection</th>
//                     <th>Désignation</th>
//                     <th>Numéro</th>
//                     <th>Unité</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {articleCategorie.map(article => (
//                     <tr key={article.id}>
//                       <td>
//                         <input
//                           type="checkbox"
//                           checked={selectedArticles.some(a => a.id === article.id)}
//                           onChange={() => handleArticleSelect(article)}
//                         />
//                       </td>
//                       <td>{article.designation}</td>
//                       <td>{article.numero ?? '—'}</td>
//                       <td>{article.unite ?? '—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p>Aucun article trouvé pour cette catégorie.</p>
//             )}

//             {selectedArticlesTable.length > 0 && (
//               <SelectedArticlesSection>
//                 <h3>Articles sélectionnés</h3>

//                 <button onClick={() => setShowSelectedArticles(!showSelectedArticles)} className="footer-button">
//                   {showSelectedArticles ? 'Cacher les articles sélectionnés' : 'Afficher les articles sélectionnés'}
//                 </button>

//                 {showSelectedArticles && (
//                   <ListeArticle listeArt={selectedArticlesTable} onArticleUpdated={handleArticleTableUpdate} />
//                 )}
//               </SelectedArticlesSection>
//             )}
//           </TabContent>
//         </TabContainer>

//         <ButtonRow2>
//           <Button onClick={handleSaveProjet}>Sauvegarder Projet et Articles</Button>
//         </ButtonRow2>
//         <ButtonRow>
//           <Button onClick={() => handleCardClick('/FirstPage')}>Ajouter Famille</Button>
//           <Button onClick={() => handleCardClick('/FirstPage')}>Ajouter Article</Button>
          
//   <Button onClick={() => handleCardClick('/FirstPage')}>Home</Button>
//         </ButtonRow>
//          </Card>
//        </Container>
//    );
//    };
  
//    export default TenderCard;



// import React, { useEffect, useState } from 'react';
// import SelectInput from './SelectInput';
// import { db } from "../../firebase";
// import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
// import './Test2.css';
// import { useNavigate } from 'react-router-dom';
// import {
//   FormGroup, Button, ButtonRow2, ButtonRow, FormLabel, ModalFormGrid,
//   FormGrid, Container, Card, Header, HeaderLeft, Subtitle, HeaderRight, Title, TabContainer,
//   FormInput, DatesGrid, CloseButton, ModalContent, DateLabel, Modal, DateInput, TabContent, DateGroup, SelectedArticlesSection
// } from '../Styled';
// import ListeArticle from './ListeArticle/ListeArticle';

// const TenderCard = () => {
//   const [activeTab, setActiveTab] = useState('dates');
//   const [categories, setCategories] = useState([]);
//   const [listeArticle, setListeArticles] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [articleCategorie, setArticleCategorie] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentArticleToModify, setCurrentArticleToModify] = useState(null);
//   const [showSelectedArticles, setShowSelectedArticles] = useState(false);
//   const [selectedArticles, setSelectedArticles] = useState([]);
//   const [selectedArticlesTable, setSelectedArticlesTable] = useState([]);
//   // New state for project TVA
//   const [projectTVA, setProjectTVA] = useState('');

//   const navigate = useNavigate();

//   const handleCardClick = (route) => {
//     navigate(route);
//   };

//   const handleArticleTableUpdate = (updatedArticles) => {
//     const currentArticlesString = JSON.stringify(selectedArticlesTable);
//     // Remove tvaRate from article objects before comparing/setting
//     const newArticlesString = JSON.stringify(updatedArticles.map(article => {
//       const { tvaRate, ...rest } = article; // Destructure to remove tvaRate
//       return {
//         articleNumber: rest.articleNumber,
//         designation: rest.designation,
//         quantity: parseFloat(rest.quantity) || 0,
//         unitPrice: parseFloat(rest.unitPrice) || 0,
//         unite: rest.unite,
//         id: rest.id
//       };
//     }));

//     if (currentArticlesString !== newArticlesString) {
//       setSelectedArticlesTable(updatedArticles.map(article => {
//         const { tvaRate, ...rest } = article; // Destructure to remove tvaRate
//         return {
//           articleNumber: rest.articleNumber,
//           designation: rest.designation,
//           quantity: parseFloat(rest.quantity) || 0,
//           unitPrice: parseFloat(rest.unitPrice) || 0,
//           unite: rest.unite,
//           id: rest.id
//         };
//       }));
//     }
//   };

//   const handleSaveProjetEtArticles = async () => {
//     const numProjet = document.getElementById('numProjet').value.trim();
//     const description = document.getElementById('description').value.trim();
//     const delais = document.getElementById('Delais').value.trim();
//     const budget = document.getElementById('Budget').value.trim();
//     const bank = document.getElementById('bank').value.trim();
//     const dateApprobation = document.getElementById('dateApprobation').value;
//     const dateDemarrage = document.getElementById('dateDemarrage').value;

//     if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage || !delais || !budget || !projectTVA) {
//       alert('Veuillez remplir tous les champs du projet, y compris la TVA du projet.');
//       return;
//     }

//     if (isNaN(parseFloat(projectTVA))) {
//       alert('La TVA du projet doit être un nombre valide.');
//       return;
//     }

//     for (let i = 0; i < selectedArticlesTable.length; i++) {
//       const article = selectedArticlesTable[i];
//       const {
//         articleNumber,
//         designation,
//         quantity,
//         unitPrice,
//       } = article;

//       if (
//         !articleNumber ||
//         !designation ||
//         isNaN(quantity) ||
//         isNaN(unitPrice)
//       ) {
//         alert(`Veuillez remplir correctement tous les champs de l'article ${i + 1}`);
//         return;
//       }
//     }

//     try {
//       const projetRef = await addDoc(collection(db, "projets"), {
//         numProjet,
//         description,
//         bank,
//         delais,
//         budget,
//         dateApprobation,
//         dateDemarrage,
//         tva: parseFloat(projectTVA), // Save project TVA
//         createdAt: new Date().toISOString(),
//       });

//       const projetId = projetRef.id;

//       const articlesPromises = selectedArticlesTable.map((article) =>
//         addDoc(collection(db, "projets", projetId, "ArticlesProjet"), {
//           articleNumber: article.articleNumber,
//           designation: article.designation,
//           quantity: parseFloat(article.quantity),
//           unitPrice: parseFloat(article.unitPrice),
//           unite: article.unite,
//           // tvaRate is no longer stored per article
//         })
//       );
//       await Promise.all(articlesPromises);

//       alert("Projet et articles sauvegardés avec succès !");
//     } catch (error) {
//       console.error("Erreur lors de la sauvegarde :", error);
//       alert("Une erreur est survenue !");
//     }
//   };

//   const addProjectToFirebase = async (projectData) => {
//     try {
//       const docRef = await addDoc(collection(db, 'projects'), projectData);
//       return docRef.id;
//     } catch (error) {
//       console.error('Erreur lors de l’ajout du projet :', error);
//       throw error;
//     }
//   };

//   const addArticlesToFirebase = async (articles, projectId) => {
//     const articlesRef = collection(db, 'articlesProjet');

//     try {
//       const batchPromises = articles.map(article => {
//         return addDoc(articlesRef, {
//           ...article,
//           projectId: projectId,
//         });
//       });

//       await Promise.all(batchPromises);
//       console.log('Tous les articles ont été ajoutés.');
//     } catch (error) {
//       console.error('Erreur lors de l’ajout des articles :', error);
//     }
//   };

//   const handleSaveProjet = async () => {
//     const numProjet = document.getElementById('numProjet').value.trim();
//     const description = document.getElementById('description').value.trim();
//     const delais = document.getElementById('Delais').value.trim();
//     const budget = document.getElementById('Budget').value.trim();
//     const bank = document.getElementById('bank').value.trim();
//     const dateApprobation = document.getElementById('dateApprobation').value;
//     const dateDemarrage = document.getElementById('dateDemarrage').value;

//     if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage || !delais || !budget || !projectTVA) {
//       alert('Veuillez remplir tous les champs du projet, y compris la TVA du projet.');
//       return;
//     }

//     if (isNaN(parseFloat(projectTVA))) {
//       alert('La TVA du projet doit être un nombre valide.');
//       return;
//     }

//     if (selectedArticlesTable.length === 0) {
//       alert('Veuillez sélectionner au moins un article.');
//       return;
//     }

//     // Validation des articles directement depuis l'état local
//     const areArticlesValid = selectedArticlesTable.every(article =>
//       article.articleNumber &&
//       article.designation &&
//       !isNaN(article.quantity) &&
//       !isNaN(article.unitPrice) &&
//       article.unite
//     );

//     if (!areArticlesValid) {
//       alert('Veuillez remplir correctement tous les champs de tous les articles sélectionnés (numéro, désignation, quantité, prix unitaire, unité).');
//       return;
//     }

//     const projectData = {
//       numProjet,
//       description,
//       bank,
//       delais,
//       budget,
//       tva: parseFloat(projectTVA), // Save project TVA
//       dateApprobation,
//       dateDemarrage,
//       createdAt: new Date().toISOString(),
//     };

//     try {
//       const projectId = await addProjectToFirebase(projectData);
//       console.log(projectId);
//       const articlesToSave = selectedArticlesTable.map(article => ({
//         articleNumber: article.articleNumber,
//         designation: article.designation,
//         quantity: parseFloat(article.quantity),
//         unitPrice: parseFloat(article.unitPrice),
//         unite: article.unite,
//         projectId: projectId, // Ajouter l'ID du projet à chaque article
//       }));
//       await addArticlesToFirebase(articlesToSave, projectId);
//       alert('Projet et articles ajoutés avec succès !');
//       // Optionnel : vider les champs ou rediriger l’utilisateur
//     } catch (error) {
//       alert("Une erreur est survenue lors de l'enregistrement.");
//     }
//   };

//   const validateSelectedArticles = () => {
//     return selectedArticlesTable.every(article =>
//       article.articleNumber &&
//       article.designation &&
//       !isNaN(article.quantity) &&
//       !isNaN(article.unitPrice) &&
//       article.unite
//     );
//   };

//   const [newArticleProjet, setNewArticleProjet] = useState({
//     numero: '',
//     designation: '',
//     quantite: '',
//     prix: '',
//     unite: ''
//   });

//   // Fonction pour gérer les changements dans le formulaire de nouvel article
//   const handleNewArticleChange = (e) => {
//     const { name, value } = e.target;
//     setNewArticleProjet(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Fonction pour sauvegarder le nouvel article de projet
//   const handleSaveNewArticleProjet = async () => {
//     try {
//       // Ajouter la logique pour sauvegarder dans Firestore
//       const newArticleRef = await addDoc(collection(db, 'articlesProjets'), {
//         ...newArticleProjet,
//         articleOriginalId: currentArticleToModify.id,
//         dateCreation: new Date()
//       });

//       // Mettre à jour la liste des articles sélectionnés
//       const updatedArticle = {
//         ...currentArticleToModify,
//         ...newArticleProjet,
//         projetArticleId: newArticleRef.id
//       }; // Mise à jour des états
//       setSelectedArticlesTable(prev =>
//         prev.map(article =>
//           article.id === currentArticleToModify.id ? updatedArticle : article
//         )
//       );

//       // Fermer le modal
//       setIsModalOpen(false);

//       // Réinitialiser le formulaire
//       setNewArticleProjet({
//         numero: '',
//         designation: '',
//         quantite: '',
//         prix: '',
//         unite: ''
//       });
//     } catch (error) {
//       console.error("Erreur lors de la sauvegarde de l'article:", error);
//     }
//   };

//   // Charger les catégories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const querySnapshot = await getDocs(collection(db, 'categories'));
//       const cats = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         name: doc.data().designation || `Catégorie ${doc.id}`
//       }));
//       setCategories(cats);
//     };
//     fetchCategories();
//   }, []);

//   // Charger tous les articles (seulement pour obtenir les ids et catégories)
//   useEffect(() => {
//     const fetchArticles = async () => {
//       const snapShot = await getDocs(collection(db, 'articles'));
//       const articles = snapShot.docs.map(doc => ({
//         id: doc.id,
//         designation: doc.data().designation || '',
//         numero: doc.data().numero || '',
//         unite: doc.data().unite || '',
//         categorie: doc.data().categorie || `article ${doc.id}`
//       }));
//       setListeArticles(articles);
//       setLoading(false);
//     };
//     fetchArticles();
//   }, []);

//   // Charger les articles pour la catégorie sélectionnée
//   useEffect(() => {
//     const fetchArticleByID = async (id) => {
//       const docRef = doc(db, "articles", id);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         return { id: docSnap.id, ...docSnap.data() };
//       }
//       return null;
//     };

//     const loadArticlesForCategory = async () => {
//       if (!selectedCategory) return;
//       const filtered = listeArticle.filter(article => article.categorie === selectedCategory);
//       const articlesDetails = await Promise.all(filtered.map(a => fetchArticleByID(a.id)));
//       setArticleCategorie(articlesDetails.filter(Boolean));
//     };

//     loadArticlesForCategory();
//   }, [selectedCategory, listeArticle]);

//   // Fonction pour gérer la sélection/désélection des articles
//   const handleArticleSelect = (article) => {
//     const isAlreadySelected = selectedArticles.some(a => a.id === article.id);

//     if (isAlreadySelected) {
//       setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
//       setSelectedArticlesTable(selectedArticlesTable.filter(a => a.id !== article.id));
//     } else {
//       setSelectedArticles([...selectedArticles, article]);
//       // When adding, ensure tvaRate is not copied from the original article if it exists
//       setSelectedArticlesTable([...selectedArticlesTable, { ...article, tvaRate: undefined }]);
//     }
//   };

//   return (
//     <Container>
//       <Card>
//         <Header>
//           <HeaderLeft>
//             <Subtitle>GC_E01</Subtitle>
//           </HeaderLeft>
//           <HeaderRight>
//             <Title>Carte de transaction</Title>
//             <Subtitle>Direction générale de l'ingénierie, chef du service des travaux publics 3</Subtitle>
//           </HeaderRight>
//         </Header>

//         <FormGrid>
//           <FormGroup>
//             <FormLabel htmlFor="tenderNumber">n° Projet </FormLabel>
//             <FormInput type="text" id="numProjet" placeholder="2024036" />
//           </FormGroup>

//           <FormGroup>
//             <FormLabel htmlFor="subject">Description</FormLabel>
//             <FormInput type="text" id="description" placeholder="Description du projet" />
//           </FormGroup>

//           <FormGroup>
//             <FormLabel htmlFor="bank">Banque</FormLabel>
//             <FormInput type="text" id="bank" placeholder="Banque" />
//           </FormGroup>
//           <FormGroup>
//             <FormLabel htmlFor="delais">Delais</FormLabel>
//             <FormInput type="text" id="Delais" placeholder="Delais" />
//           </FormGroup>
//           <FormGroup>
//             <FormLabel htmlFor="budget">Budget</FormLabel>
//             <FormInput type="text" id="Budget" placeholder="Budget" />
//           </FormGroup>
//           {/* New Project TVA input */}
//           <FormGroup>
//             <FormLabel htmlFor="projectTVA">TVA Projet (%)</FormLabel>
//             <FormInput
//               type="number"
//               id="projectTVA"
//               placeholder="Ex: 20"
//               value={projectTVA}
//               onChange={(e) => setProjectTVA(e.target.value)}
//               min="0"
//               step="0.01"
//             />
//           </FormGroup>
//         </FormGrid>

//         <TabContainer>
//           <ButtonRow>
//             <Button onClick={() => setActiveTab('dates')} className={activeTab === 'dates' ? 'active' : ''}>
//               Dates
//             </Button>
//             <Button onClick={() => setActiveTab('articles')} className={activeTab === 'articles' ? 'active' : ''}>
//               Articles
//             </Button>
//           </ButtonRow>

//           <TabContent className={activeTab === 'dates' ? '' : 'hidden'}>
//             <DatesGrid>
//               <DateGroup>
//                 <DateLabel htmlFor="dateApprobation">Date d'approbation</DateLabel>
//                 <DateInput type="date" id="dateApprobation" />
//               </DateGroup>
//               <DateGroup>
//                 <DateLabel htmlFor="dateDemarrage">Date de démarrage</DateLabel>
//                 <DateInput type="date" id="dateDemarrage" />
//               </DateGroup>
//             </DatesGrid>
//           </TabContent>

//           <TabContent className={activeTab === 'articles' ? '' : 'hidden'}>
//             <DatesGrid>
//               <DateGroup>
//                 <DateLabel htmlFor="categorie">Catégorie</DateLabel>
//                 <SelectInput
//                   id="categorie"
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   options={categories.map(cat => ({
//                     value: cat.id,
//                     label: cat.name
//                   }))}
//                 />
//               </DateGroup>
//             </DatesGrid>

//             {selectedCategory && articleCategorie.length > 0 ? (
//               <table className="article-table">
//                 <thead>
//                   <tr>
//                     <th>Sélection</th>
//                     <th>Désignation</th>
//                     <th>Numéro</th>
//                     <th>Unité</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {articleCategorie.map(article => (
//                     <tr key={article.id}>
//                       <td>
//                         <input
//                           type="checkbox"
//                           checked={selectedArticles.some(a => a.id === article.id)}
//                           onChange={() => handleArticleSelect(article)}
//                         />
//                       </td>
//                       <td>{article.designation}</td>
//                       <td>{article.numero ?? '—'}</td>
//                       <td>{article.unite ?? '—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p>Aucun article trouvé pour cette catégorie.</p>
//             )}

//             {selectedArticlesTable.length > 0 && (
//               <SelectedArticlesSection>
//                 <h3>Articles sélectionnés</h3>

//                 <button onClick={() => setShowSelectedArticles(!showSelectedArticles)} className="footer-button">
//                   {showSelectedArticles ? 'Cacher les articles sélectionnés' : 'Afficher les articles sélectionnés'}
//                 </button>

//                 {showSelectedArticles && (
                  
//                    <ListeArticle
//         listeArt={selectedArticlesTable}
//         onArticleUpdated={handleArticleTableUpdate}
//         projectTVA={projectTVA} 
//     />
//                 )}
//               </SelectedArticlesSection>
//             )}
//           </TabContent>
//         </TabContainer>

//         <ButtonRow2>
//           <Button onClick={handleSaveProjet}>Sauvegarder Projet et Articles</Button>
//         </ButtonRow2>
//         <ButtonRow>
//           {/* <Button onClick={() => handleCardClick('/FirstPage')}>Ajouter Famille</Button>
//           <Button onClick={() => handleCardClick('/FirstPage')}>Ajouter Article</Button> */}
//           <Button onClick={() => handleCardClick('/FirstPage')}>Home</Button>
//         </ButtonRow>
//       </Card>
//     </Container>
//   );
// };

// export default TenderCard;
import React, { useEffect, useState } from 'react';
import SelectInput from './SelectInput';
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import './Test2.css';
import { useNavigate } from 'react-router-dom';
import {
  FormGroup, Button, ButtonRow2, ButtonRow, FormLabel, ModalFormGrid,
  FormGrid, Container, Card, Header, HeaderLeft, Subtitle, HeaderRight, Title, TabContainer,
  FormInput, DatesGrid, CloseButton, ModalContent, DateLabel, Modal, DateInput, TabContent, DateGroup, SelectedArticlesSection
} from '../Styled';
import ListeArticle from './ListeArticle/ListeArticle';

const TenderCard = () => {
  const [activeTab, setActiveTab] = useState('dates');
  const [categories, setCategories] = useState([]);
  const [listeArticle, setListeArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articleCategorie, setArticleCategorie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticleToModify, setCurrentArticleToModify] = useState(null);
  const [showSelectedArticles, setShowSelectedArticles] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedArticlesTable, setSelectedArticlesTable] = useState([]);
  // New state for project TVA
  const [projectTVA, setProjectTVA] = useState('');
    // New state for project name
    const [projectName, setProjectName] = useState('');

  const navigate = useNavigate();

  const handleCardClick = (route) => {
    navigate(route);
  };

  const handleArticleTableUpdate = (updatedArticles) => {
    const currentArticlesString = JSON.stringify(selectedArticlesTable);
    // Remove tvaRate from article objects before comparing/setting
    const newArticlesString = JSON.stringify(updatedArticles.map(article => {
      const { tvaRate, ...rest } = article; // Destructure to remove tvaRate
      return {
        articleNumber: rest.articleNumber,
        designation: rest.designation,
        quantity: parseFloat(rest.quantity) || 0,
        unitPrice: parseFloat(rest.unitPrice) || 0,
        unite: rest.unite,
        id: rest.id
      };
    }));

    if (currentArticlesString !== newArticlesString) {
      setSelectedArticlesTable(updatedArticles.map(article => {
        const { tvaRate, ...rest } = article; // Destructure to remove tvaRate
        return {
          articleNumber: rest.articleNumber,
          designation: rest.designation,
          quantity: parseFloat(rest.quantity) || 0,
          unitPrice: parseFloat(rest.unitPrice) || 0,
          unite: rest.unite,
          id: rest.id
        };
      }));
    }
  };

  const handleSaveProjetEtArticles = async () => {
    const numProjet = document.getElementById('numProjet').value.trim();
    const description = document.getElementById('description').value.trim();
    const delais = document.getElementById('Delais').value.trim();
    const budget = document.getElementById('Budget').value.trim();
    const bank = document.getElementById('bank').value.trim();
    const dateApprobation = document.getElementById('dateApprobation').value;
    const dateDemarrage = document.getElementById('dateDemarrage').value;

    if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage || !delais || !budget || !projectTVA || !projectName) {
      alert('Veuillez remplir tous les champs du projet, y compris la TVA du projet et le nom du projet.');
      return;
    }

    if (isNaN(parseFloat(projectTVA))) {
      alert('La TVA du projet doit être un nombre valide.');
      return;
    }

    for (let i = 0; i < selectedArticlesTable.length; i++) {
      const article = selectedArticlesTable[i];
      const {
        articleNumber,
        designation,
        quantity,
        unitPrice,
      } = article;

      if (
        !articleNumber ||
        !designation ||
        isNaN(quantity) ||
        isNaN(unitPrice)
      ) {
        alert(`Veuillez remplir correctement tous les champs de l'article ${i + 1}`);
        return;
      }
    }

    try {
      const projetRef = await addDoc(collection(db, "projets"), {
        numProjet,
        description,
        bank,
        delais,
        budget,
        dateApprobation,
        dateDemarrage,
        tva: parseFloat(projectTVA), // Save project TVA
            nomProjet: projectName, // Save project name
        createdAt: new Date().toISOString(),
      });

      const projetId = projetRef.id;

      const articlesPromises = selectedArticlesTable.map((article) =>
        addDoc(collection(db, "projets", projetId, "ArticlesProjet"), {
          articleNumber: article.articleNumber,
          designation: article.designation,
          quantity: parseFloat(article.quantity),
          unitPrice: parseFloat(article.unitPrice),
          unite: article.unite,
          // tvaRate is no longer stored per article
        })
      );
      await Promise.all(articlesPromises);

      alert("Projet et articles sauvegardés avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("Une erreur est survenue !");
    }
  };

  const addProjectToFirebase = async (projectData) => {
    try {
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l’ajout du projet :', error);
      throw error;
    }
  };

  const addArticlesToFirebase = async (articles, projectId) => {
    const articlesRef = collection(db, 'articlesProjet');

    try {
      const batchPromises = articles.map(article => {
        return addDoc(articlesRef, {
          ...article,
          projectId: projectId,
        });
      });

      await Promise.all(batchPromises);
      console.log('Tous les articles ont été ajoutés.');
    } catch (error) {
      console.error('Erreur lors de l’ajout des articles :', error);
    }
  };

  const handleSaveProjet = async () => {
    const numProjet = document.getElementById('numProjet').value.trim();
    const description = document.getElementById('description').value.trim();
    const delais = document.getElementById('Delais').value.trim();
    const budget = document.getElementById('Budget').value.trim();
    const bank = document.getElementById('bank').value.trim();
    const dateApprobation = document.getElementById('dateApprobation').value;
    const dateDemarrage = document.getElementById('dateDemarrage').value;

    if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage || !delais || !budget || !projectTVA || !projectName) {
      alert('Veuillez remplir tous les champs du projet, y compris la TVA du projet et le nom du projet.');
      return;
    }

    if (isNaN(parseFloat(projectTVA))) {
      alert('La TVA du projet doit être un nombre valide.');
      return;
    }

    if (selectedArticlesTable.length === 0) {
      alert('Veuillez sélectionner au moins un article.');
      return;
    }

    // Validation des articles directement depuis l'état local
    const areArticlesValid = selectedArticlesTable.every(article =>
      article.articleNumber &&
      article.designation &&
      !isNaN(article.quantity) &&
      !isNaN(article.unitPrice) &&
      article.unite
    );

    if (!areArticlesValid) {
      alert('Veuillez remplir correctement tous les champs de tous les articles sélectionnés (numéro, désignation, quantité, prix unitaire, unité).');
      return;
    }

    const projectData = {
      numProjet,
      description,
      bank,
      delais,
      budget,
      tva: parseFloat(projectTVA), 
            nomProjet: projectName,  
      dateApprobation,
      dateDemarrage,
      createdAt: new Date().toISOString(),
    };

    try {
      const projectId = await addProjectToFirebase(projectData);
      console.log(projectId);
      const articlesToSave = selectedArticlesTable.map(article => ({
        articleNumber: article.articleNumber,
        designation: article.designation,
        quantity: parseFloat(article.quantity),
        unitPrice: parseFloat(article.unitPrice),
        unite: article.unite,
        projectId: projectId, // Ajouter l'ID du projet à chaque article
      }));
      await addArticlesToFirebase(articlesToSave, projectId);
      alert('Projet et articles ajoutés avec succès !');
      // Optionnel : vider les champs ou rediriger l’utilisateur
    } catch (error) {
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const validateSelectedArticles = () => {
    return selectedArticlesTable.every(article =>
      article.articleNumber &&
      article.designation &&
      !isNaN(article.quantity) &&
      !isNaN(article.unitPrice) &&
      article.unite
    );
  };

  const [newArticleProjet, setNewArticleProjet] = useState({
    numero: '',
    designation: '',
    quantite: '',
    prix: '',
    unite: ''
  });

  // Fonction pour gérer les changements dans le formulaire de nouvel article
  const handleNewArticleChange = (e) => {
    const { name, value } = e.target;
    setNewArticleProjet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour sauvegarder le nouvel article de projet
  const handleSaveNewArticleProjet = async () => {
    try {
      // Ajouter la logique pour sauvegarder dans Firestore
      const newArticleRef = await addDoc(collection(db, 'articlesProjets'), {
        ...newArticleProjet,
        articleOriginalId: currentArticleToModify.id,
        dateCreation: new Date()
      });

      // Mettre à jour la liste des articles sélectionnés
      const updatedArticle = {
        ...currentArticleToModify,
        ...newArticleProjet,
        projetArticleId: newArticleRef.id
      }; // Mise à jour des états
      setSelectedArticlesTable(prev =>
        prev.map(article =>
          article.id === currentArticleToModify.id ? updatedArticle : article
        )
      );

      // Fermer le modal
      setIsModalOpen(false);

      // Réinitialiser le formulaire
      setNewArticleProjet({
        numero: '',
        designation: '',
        quantite: '',
        prix: '',
        unite: ''
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'article:", error);
    }
  };

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().designation || `Catégorie ${doc.id}`
      }));
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // Charger tous les articles (seulement pour obtenir les ids et catégories)
  useEffect(() => {
    const fetchArticles = async () => {
      const snapShot = await getDocs(collection(db, 'articles'));
      const articles = snapShot.docs.map(doc => ({
        id: doc.id,
        designation: doc.data().designation || '',
        numero: doc.data().numero || '',
        unite: doc.data().unite || '',
        categorie: doc.data().categorie || `article ${doc.id}`
      }));
      setListeArticles(articles);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  // Charger les articles pour la catégorie sélectionnée
  useEffect(() => {
    const fetchArticleByID = async (id) => {
      const docRef = doc(db, "articles", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    };

    const loadArticlesForCategory = async () => {
      if (!selectedCategory) return;
      const filtered = listeArticle.filter(article => article.categorie === selectedCategory);
      const articlesDetails = await Promise.all(filtered.map(a => fetchArticleByID(a.id)));
      setArticleCategorie(articlesDetails.filter(Boolean));
    };

    loadArticlesForCategory();
  }, [selectedCategory, listeArticle]);

  // Fonction pour gérer la sélection/désélection des articles
  const handleArticleSelect = (article) => {
    const isAlreadySelected = selectedArticles.some(a => a.id === article.id);

    if (isAlreadySelected) {
      setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
      setSelectedArticlesTable(selectedArticlesTable.filter(a => a.id !== article.id));
    } else {
      setSelectedArticles([...selectedArticles, article]);
      // When adding, ensure tvaRate is not copied from the original article if it exists
      setSelectedArticlesTable([...selectedArticlesTable, { ...article, tvaRate: undefined }]);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <HeaderLeft>
            <Subtitle>GC_E01</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <Title>Fiche Projet</Title>
            <Subtitle>Direction générale de l'ingénierie, chef du service des travaux publics 3</Subtitle>
          </HeaderRight>
        </Header>

        <FormGrid>
          <FormGroup>
            <FormLabel htmlFor="tenderNumber">n° Projet </FormLabel>
            <FormInput type="text" id="numProjet" placeholder="2024036" />
          </FormGroup>

            {/* New Project Name input */}
            <FormGroup>
              <FormLabel htmlFor="projectName">Nom du Projet</FormLabel>
              <FormInput
                type="text"
                id="projectName"
                placeholder="Nom du projet"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="subject">Description</FormLabel>
            <FormInput type="text" id="description" placeholder="Description du projet" />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bank">Banque</FormLabel>
            <FormInput type="text" id="bank" placeholder="Banque" />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="delais">Delais</FormLabel>
            <FormInput type="text" id="Delais" placeholder="Delais" />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="budget">Budget</FormLabel>
            <FormInput type="text" id="Budget" placeholder="Budget" />
          </FormGroup>
          {/* New Project TVA input */}
          <FormGroup>
            <FormLabel htmlFor="projectTVA">TVA Projet (%)</FormLabel>
            <FormInput
              type="number"
              id="projectTVA"
              placeholder="Ex: 20"
              value={projectTVA}
              onChange={(e) => setProjectTVA(e.target.value)}
              min="0"
              step="0.01"
            />
          </FormGroup>
        </FormGrid>

        <TabContainer>
          <ButtonRow>
            <Button onClick={() => setActiveTab('dates')} className={activeTab === 'dates' ? 'active' : ''}>
              Dates
            </Button>
            <Button onClick={() => setActiveTab('articles')} className={activeTab === 'articles' ? 'active' : ''}>
              Articles
            </Button>
          </ButtonRow>

          <TabContent className={activeTab === 'dates' ? '' : 'hidden'}>
            <DatesGrid>
              <DateGroup>
                <DateLabel htmlFor="dateApprobation">Date d'approbation</DateLabel>
                <DateInput type="date" id="dateApprobation" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="dateDemarrage">Date de démarrage</DateLabel>
                <DateInput type="date" id="dateDemarrage" />
              </DateGroup>
            </DatesGrid>
          </TabContent>

          <TabContent className={activeTab === 'articles' ? '' : 'hidden'}>
            <DatesGrid>
              <DateGroup>
                <DateLabel htmlFor="categorie">Catégorie</DateLabel>
                <SelectInput
                  id="categorie"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categories.map(cat => ({
                    value: cat.id,
                    label: cat.name
                  }))}
                />
              </DateGroup>
            </DatesGrid>

            {selectedCategory && articleCategorie.length > 0 ? (
              <table className="article-table">
                <thead>
                  <tr>
                    <th>Sélection</th>
                    <th>Désignation</th>
                    <th>Numéro</th>
                    <th>Unité</th>
                  </tr>
                </thead>
                <tbody>
                  {articleCategorie.map(article => (
                    <tr key={article.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedArticles.some(a => a.id === article.id)}
                          onChange={() => handleArticleSelect(article)}
                        />
                      </td>
                      <td>{article.designation}</td>
                      <td>{article.numero ?? '—'}</td>
                      <td>{article.unite ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun article trouvé pour cette catégorie.</p>
            )}

            {selectedArticlesTable.length > 0 && (
              <SelectedArticlesSection>
                <h3>Articles sélectionnés</h3>

                <button onClick={() => setShowSelectedArticles(!showSelectedArticles)} className="footer-button">
                  {showSelectedArticles ? 'Cacher les articles sélectionnés' : 'Afficher les articles sélectionnés'}
                </button>

                {showSelectedArticles && (
                  // Pass projectTVA to ListeArticle if needed for calculation/display
                  <ListeArticle listeArt={selectedArticlesTable} onArticleUpdated={handleArticleTableUpdate} projectTVA={projectTVA} />
                )}
              </SelectedArticlesSection>
            )}
          </TabContent>
        </TabContainer>

        <ButtonRow2>
          <Button onClick={handleSaveProjet}>Sauvegarder Projet et Articles</Button>
        </ButtonRow2>
        <ButtonRow>
          <Button onClick={() => handleCardClick('/FirstPage')}>Ajouter Famille</Button>
          <Button onClick={() => handleCardClick('/FirstPage')}>Ajouter Article</Button>
          <Button onClick={() => handleCardClick('/FirstPage')}>Home</Button>
        </ButtonRow>
      </Card>
    </Container>
  );
};

export default TenderCard;