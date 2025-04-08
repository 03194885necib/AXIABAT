
import React, { useEffect, useState } from 'react';  
import styled from 'styled-components';  
import SelectInput from './SelectInput';  
import { db } from "../../firebase";  
import { collection, getDocs, addDoc,doc, getDoc } from 'firebase/firestore';  
import './Test2.css';  
import { useNavigate } from 'react-router-dom';
const Modal = styled.div`  
  position: fixed;  
  top: 0;  
  left: 0;  
  width: 100%;  
  height: 100%;  
  background: rgba(0, 0, 0, 0.5);  
  display: ${props => props.isOpen ? 'flex' : 'none'};  
  justify-content: center;  
  align-items: center;  
  z-index: 1000;  
`;  

const ModalContent = styled.div`  
  background: white;  
  padding: 20px;  
  border-radius: 8px;  
  width: 500px;  
  max-height: 80%;  
  overflow-y: auto; 
  `;  

const ModalFormGrid = styled.div`  
  display: grid;  
  grid-template-columns: 1fr 1fr;  
  gap: 10px;  
`;  

const CloseButton = styled.button`  
  position: absolute;  
  top: 10px;  
  right: 10px;  
  background: red;  
  color: white;  
  border: none;  
  padding: 5px 10px;  
  cursor: pointer;  
`;  

const Container = styled.div`
  font-family: Arial, sans-serif;
  direction: ltr;
  margin: 20px;
  background-color: rgb(231, 224, 224);
`;

const Card = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
`;

const HeaderLeft = styled.div`
  text-align: left;
`;

const HeaderRight = styled.div`
  text-align: right;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #777;
`;

const TabContainer = styled.div`
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
`;

const TabContent = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 0 0 5px 5px;
  background-color: #fff;

  &.hidden {
    display: none;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;
const ButtonRow2 = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 100px;
  direction:rtl;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 16px;
  margin-bottom: 5px;
  color: #555;
`;

const FormInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const DatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
`;

const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateLabel = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 3px;
`;

const DateInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
`;
const SelectedArticlesSection = styled.div`  
  margin-top: 20px;  
  border: 1px solid #ddd;  
  padding: 15px;  
  border-radius: 5px;  
`;  

const TenderCard = () => {  
  const [activeTab, setActiveTab] = useState('dates');  
  const [categories, setCategories] = useState([]);  
  const [listeArticle, setListeArticles] = useState([]);  
  const [selectedCategory, setSelectedCategory] = useState('');  
  const [articleCategorie, setArticleCategorie] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [currentArticleToModify, setCurrentArticleToModify] = useState(null);  
const navigate=useNavigate()

  const handleCardClick = (route) => {
    navigate(route);
  };

  const addProjectToFirebase = async (projectData) => {
    try {
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      return docRef.id; // C’est l’ID généré par Firebase
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
          projectId: projectId, // Ajoute l'ID du projet ici
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
    const bank = document.getElementById('bank').value.trim();
    const dateApprobation = document.getElementById('dateApprobation').value;
    const dateDemarrage = document.getElementById('dateDemarrage').value;
  
    if (!numProjet || !description || !bank || !dateApprobation || !dateDemarrage) {
      alert('Veuillez remplir tous les champs du projet.');
      return;
    }
  
    if (selectedArticlesTable.length === 0) {
      alert('Veuillez sélectionner au moins un article.');
      return;
    }
  
    if (!validateSelectedArticles()) {
      alert('Tous les articles doivent être complètement modifiés avant de sauvegarder.');
      return;
    }
  
    const projectData = {
      numProjet,
      description,
      bank,
      dateApprobation,
      dateDemarrage,
      createdAt: new Date().toISOString(),
    };
  
    try {
      const projectId = await addProjectToFirebase(projectData);
      console.log(projectId)
      await addArticlesToFirebase(selectedArticlesTable, projectId);
      alert('Projet et articles ajoutés avec succès !');
      // Optionnel : vider les champs ou rediriger l’utilisateur
    } catch (error) {
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };
    


















  const validateSelectedArticles = () => {
    return selectedArticlesTable.every(article =>
      article.numero && 
      article.unite && 
      article.quantite !== undefined && 
      article.prix !== undefined && 
      article.tva !== undefined
    );
  };
  
 

  
  const [newArticleProjet, setNewArticleProjet] = useState({  
    numero: '',  
    designation: '',  
    quantite: '',  
    prix: '',  
    tva: '',  
    unite: ''  
  });  

  
  // Fonction pour ouvrir le modal de modification  
  const handleModifyArticle = (article) => {  
    setCurrentArticleToModify(article);  
    setNewArticleProjet({  
      numero: article.numero || '',  
      designation: article.designation || '',  
      quantite: '',  
      prix: '',  
      tva: '',  unite: article.unite || ''  
    });  
    setIsModalOpen(true);  
  };  

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
      };   // Mise à jour des états  
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
        tva: '',  
        unite: ''  
      });  
    } catch (error) {  console.error("Erreur lors de la sauvegarde de l'article:", error);  
    }  
  };
  
  // Nouveaux états pour la sélection des articles  
  const [selectedArticles, setSelectedArticles] = useState([]);  
  const [selectedArticlesTable, setSelectedArticlesTable] = useState([]);  

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
    // Vérifier si l'article est déjà sélectionné  
    const isAlreadySelected = selectedArticles.some(a => a.id === article.id);  
    
    if (isAlreadySelected) {  
      // Désélectionner l'article  
      setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));  
      setSelectedArticlesTable(selectedArticlesTable.filter(a => a.id !== article.id));  
    } else {  
      // Sélectionner l'article  
      setSelectedArticles([...selectedArticles, article]);  
      setSelectedArticlesTable([...selectedArticlesTable, article]);  
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
            <Title>Carte de transaction</Title>  
            <Subtitle>Direction générale de l'ingénierie, chef du service des travaux publics 3</Subtitle>  
          </HeaderRight>  
        </Header>  

        <FormGrid>  
          {/* Formulaire existant */}  
          <FormGroup>  
            <FormLabel htmlFor="tenderNumber">n° Projet </FormLabel>  
            <FormInput type="text" id="numProjet" placeholder="2024036" />  
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
            <FormLabel htmlFor="bank">Delais</FormLabel>  
            <FormInput type="text" id="Delais" placeholder="Banque" />  
          </FormGroup> 
          <FormGroup>  
            <FormLabel htmlFor="bank">Budget</FormLabel>  
            <FormInput type="text" id="Budget" placeholder="Banque" />  
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
                <DateLabel htmlFor="announcementDate">Date d'approbation</DateLabel>  
                <DateInput type="date" id="dateApprobation" />  
              </DateGroup>  
              <DateGroup>  
                <DateLabel htmlFor="bidDeadline">Date de démarrage</DateLabel>  
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

            {/* Section des articles sélectionnés */}  
            {/* {selectedArticlesTable.length > 0 && (  
              <SelectedArticlesSection>  
                <h3>Articles sélectionnés</h3>  
                <table className="selected-articles-table">  
                  <thead>  
                    <tr>  
                      <th>Désignation</th>  
                      <th>Numéro</th>  
                      <th>Unité</th>  
                      <th>Action</th>  
                    </tr>  
                  </thead>  
                  <tbody>  
                    {selectedArticlesTable.map(article => (  
                      <tr key={article.id}>  
                        <td>{article.designation}</td>  
                        <td>{article.numero ?? '—'}</td>  
                        <td>{article.unite ?? '—'}</td>  
                        <td>  
                          <Button   
                            onClick={() => handleArticleSelect(article)}  
                            style={{ backgroundColor: 'red', padding: '5px' }}  
                          >  
                            Retirer  
                          </Button>  
                        </td>  
                      </tr>  
                    ))}  
                  </tbody>  
                </table>  
              </SelectedArticlesSection>  
            )}   */}
            {selectedArticlesTable.length > 0 && (
            <SelectedArticlesSection>  
          <h3>Articles sélectionnés</h3>  
          <table className="selected-articles-table">  
            <thead>  
              <tr>  
                <th>Désignation</th>  
                <th>Numéro</th>  
                <th>Unité</th>  
                <th>Actions</th>  
              </tr>  
            </thead>  
            <tbody>  
              {selectedArticlesTable.map(article => (  
                <tr key={article.id}>  
                  <td>{article.designation}</td>  
                  <td>{article.numero ?? '—'}</td>  
                  <td>{article.unite ?? '—'}</td>  
                  <td>  <Button   
                      onClick={() => handleModifyArticle(article)}  
                      style={{ backgroundColor: 'orange', padding: '5px', marginRight: '5px' }}  
                    >  
                      Modifier  
                    </Button>  
                    <Button   
                      onClick={() => handleArticleSelect(article)}  
                      style={{ backgroundColor: 'red', padding: '5px' }}  
                    >  
                      Retirer  
                    </Button>  
                  </td>  
                </tr>  
              ))}  
            </tbody>  
          </table>  
        </SelectedArticlesSection>  
      )}  {/* Modal pour ajouter/modifier un article de projet */}  
      <Modal isOpen={isModalOpen}>  
        <ModalContent>  
          <h2>Ajouter un article au projet</h2>  
          <CloseButton onClick={() => setIsModalOpen(false)}>X</CloseButton>  
          
          <ModalFormGrid>  
            <FormGroup>  
              <FormLabel>Désignation</FormLabel>  
              <FormInput   
                type="text"   
                name="designation"  
                value={newArticleProjet.designation}  
                onChange={handleNewArticleChange}  
                readOnly  
              />  
            </FormGroup>  
            <FormGroup>  
              <FormLabel>Numéro</FormLabel>  
              <FormInput   
                type="text"   
                name="numero"  
                value={newArticleProjet.numero}  
                onChange={handleNewArticleChange}  
              />  
            </FormGroup>  
            
            <FormGroup>  
              <FormLabel>Unité</FormLabel>  
              <FormInput   
                type="text"   
                name="unite"  
                value={newArticleProjet.unite}  
                onChange={handleNewArticleChange}  
              />  
            </FormGroup> 
            <FormGroup>  
              <FormLabel>Quantité</FormLabel>  
              <FormInput   
                type="number"   
                name="quantite"  
                value={newArticleProjet.quantite}  
                onChange={handleNewArticleChange}  
              />  
            </FormGroup>  
            
            <FormGroup>  
              <FormLabel>Prix Unitaire</FormLabel>  
              <FormInput   
                type="number"   
                name="prix"  
                value={newArticleProjet.prix}  
                onChange={handleNewArticleChange}  
              />   </FormGroup>  
            
              <FormGroup>  
                <FormLabel>TVA (%)</FormLabel>  
                <FormInput   
                  type="number"   
                  name="tva"  
                  value={newArticleProjet.tva}  
                  onChange={handleNewArticleChange}  
                />  
              </FormGroup>  
            </ModalFormGrid>  
            
            <ButtonRow style={{ marginTop: '20px' }}>  
              <Button onClick={handleSaveNewArticleProjet}>  
                Sauvegarder  
              </Button>  
              <Button   
                onClick={() => setIsModalOpen(false)}  
                style={{ backgroundColor: 'gray' }}  
                >  
                  Annuler  
                </Button>  
              </ButtonRow>  
            </ModalContent>  
          </Modal>  
          </TabContent>  
        </TabContainer>  

        <ButtonRow2>  
          <Button onClick={handleSaveProjet}>Sauvegarder Projet</Button>  
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



