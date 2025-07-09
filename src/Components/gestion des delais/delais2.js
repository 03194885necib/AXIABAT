// import React, { useState, useEffect } from 'react';  
// import { collection, getDocs,addDoc } from 'firebase/firestore';  
// import { db } from '../../firebase';  
// import {  
//     Container, Card, Header, HeaderLeft, Subtitle, HeaderRight, Title,  
//     FormGrid, FormGroup, FormLabel, FormInput, ButtonRow, Button,  
//     DateInput,  
// } from '../Styled';  
// import { addDays, parseISO, format, differenceInDays } from 'date-fns';  
// import SelectInput from '../FicheProjet/SelectInput';  

// const DeadlineManagementCard = () => {  
   
//     const [projects, setProjects] = useState([]);  
//     const [selectedProject, setSelectedProject] = useState('');  
//     const [caseTitle, setCaseTitle] = useState('');  
//     const [budget, setBudgetProjet] = useState("");  
//     const [dateDemarrage, setDateDemarrage] = useState("");  
//     const [delais, setDelais] = useState("");  
//     const [dateFinReelle, setDateFinReelle] = useState('');  
    
//     const [delaiSupplementaire, setDelaiSupplementaire] = useState(0);
    
//     const [startDate, setStartDate] = useState('');
//     const [dateFin, setDateFin] = useState('')

//     const [contractualDeadline, setContractualDeadline] = useState('');
//     const [actualEndDate, setActualEndDate] = useState('');
//     const [showWorkProgress, setShowWorkProgress] = useState(false);
//     const [showWorkStoppage, setShowWorkStoppage] = useState(false);

//     // State for Work Progress fields
//     const [progressDescription, setProgressDescription] = useState('');
//     const [progressPercentage, setProgressPercentage] = useState('');


     
//     const [workStoppages, setWorkStoppages] = useState([  
//         {  
//             startDate: '',  
//             endDate: '',  
//             reason: '',  
//             monthOfStoppage: '',
//         }  
//     ]);  

//     // Effet pour charger les projets  
//     useEffect(() => {  
//         const fetchProjects = async () => {  
//             try {  
//                 const projectsCollection = collection(db, 'projects');  
//                 const projectSnapshot = await getDocs(projectsCollection);  
//                 const projectList = projectSnapshot.docs.map(doc => ({  
//                     id: doc.id,  
//                     numProjet: doc.data().numProjet,  
//                     description: doc.data().description,  
//                     budget: doc.data().budget,  
//                     dateDemarrage: doc.data().dateDemarrage,  
//                     delais: doc.data().delais,  
//                 }));  
//                 setProjects(projectList);  
//             } catch (error) {  
//                 console.error("Error fetching projects:", error);  
//             }  
//         };  

//         fetchProjects();  
//     }, []);  

//     // Effet pour calculer initialement la date de fin réelle  
//     useEffect(() => {  
//         if (dateDemarrage && delais) {  
//             const initialDateFinReelle = calculateInitialDateFinReelle(dateDemarrage, delais);  
//             setDateFinReelle(initialDateFinReelle);  
//             console.log("date fin reele ",dateFinReelle)
//         }  
//     }, [dateDemarrage, delais]);  

//     // Effet pour mettre à jour la date de fin réelle en fonction des arrêts de travaux  
//     useEffect(() => {  
//         if (dateDemarrage && delais && workStoppages) {  
//             const totalStoppageDays = calculateTotalStoppageDays(workStoppages);  
//             const initialDateFinReelle = calculateInitialDateFinReelle(dateDemarrage, delais);  
            
//             const newDateFinReelle = addDays(  
//                 parseISO(initialDateFinReelle),   
//                 totalStoppageDays  
//             );  
            
//             setDateFinReelle(format(newDateFinReelle, 'yyyy-MM-dd'));  
//             setDelaiSupplementaire(totalStoppageDays);  
//         }  
//     }, [workStoppages, dateDemarrage, delais]);  

//     const handleProjectChange = (event) => {
//         const selectedProjectId = event.target.value;
//         setSelectedProject(selectedProjectId);
//         const foundProject = projects.find(project => project.id === selectedProjectId);
//         if (foundProject) {
//             setCaseTitle(foundProject.description);
//             setBudgetProjet(foundProject.budget)
//             setDateDemarrage(foundProject.dateDemarrage)
//             setDelais(foundProject.delais)

//             console.log("le delais est ",foundProject.delais)

//         } else {
//             setCaseTitle('');
//         }
//     };

   
      
//     const calculateInitialDateFinReelle = (startDate, contractualDays) => {
//         const start = parseISO(startDate);
//         const endDate = addDays(start, parseInt(contractualDays, 10));
//         return format(endDate, 'yyyy-MM-dd');
//     };

//     const handleShowWorkProgress = () => {
//         setShowWorkProgress(true);
//         setShowWorkStoppage(false);
//     };

//     const handleShowWorkStoppage = () => {
//         setShowWorkProgress(false);
//         setShowWorkStoppage(true);
//     };

   

  
// const handleSaveDeadline = async () => {
//   const workStoppageDataToSave = showWorkStoppage
//     ? workStoppages.map((stoppage) => {
//         const startDate = stoppage.startDate ? parseISO(stoppage.startDate) : null;
//         const endDate = stoppage.endDate ? parseISO(stoppage.endDate) : null;
//         const duration = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
//         let monthOfStoppage = '';
//         if (startDate) {
//           const startMonthYear = format(startDate, 'MMMM yyyy');
//           if (endDate) {
//             const endMonthYear = format(endDate, 'MMMM yyyy');
//             monthOfStoppage = startMonthYear === endMonthYear ? startMonthYear : `${startMonthYear} - ${endMonthYear}`;
//           } else {
//             monthOfStoppage = startMonthYear;
//           }
//         }

//         return {
//           startDate: stoppage.startDate,
//           endDate: stoppage.endDate,
//           duration: duration,
//           reason: stoppage.reason,
//           monthOfStoppage: monthOfStoppage,
//         };
//       })
//     : [];

//   const deadlineData = {
//     projectId: selectedProject,
//     dateFinReelle: dateFinReelle, // ✅ ENREGISTRER LA DATE FINALE REELLE
//     ...(showWorkProgress && {
//       workProgress: {
//         dateDemarrage: dateDemarrage,
//         delais: delais,
//         description: progressDescription,
//         percentage: progressPercentage,
//       },
//     }),
//     ...(showWorkStoppage && {
//       workStoppages: workStoppageDataToSave,
//     }),
//     timestamp: new Date(),
//   };

//   console.log("Données à enregistrer dans Firebase:", deadlineData);

//   try {
//     const deadlinesCollectionRef = collection(db, 'deadlines');
//     const docRef = await addDoc(deadlinesCollectionRef, deadlineData);
//     console.log("ID du document ajouté:", docRef.id);
//     alert('Informations enregistrées avec succès dans Firebase!');
//   } catch (error) {
//     console.error("Erreur lors de l'enregistrement des informations dans Firebase:", error);
//     alert("Erreur lors de l'enregistrement des informations dans Firebase.");
//   }
// };


//     const handleAddStoppage = () => {
//         setWorkStoppages([
//             ...workStoppages,
//             {
                
//                 startDate: '',
//                 endDate: '',
//                 duration: '',
//                 reason: '',
//                 monthOfStoppage: '',

//             },
//         ]);
//     };

//     const handleRemoveStoppage = (index) => {
//         const updatedWorkStoppages = workStoppages.filter((_, i) => i !== index);
//         setWorkStoppages(updatedWorkStoppages);
//     };

//     useEffect(() => {
//         if (dateDemarrage && delais) {
//             calculateDateFin(dateDemarrage, delais);
//         } else {
//             setDateFin(dateFin); 
//         }
//     }, [dateDemarrage, delais]); // Recalculate when dateDemarrage or delais changes

//     const calculateDateFin = (startDateValue, delayInDays) => {
//         try {
//             const startDate = parseISO(startDateValue);
//             const daysToAdd = parseInt(delayInDays, 10);

//             if (!isNaN(daysToAdd)) {
//                 const endDate = addDays(startDate, daysToAdd);
//                 setDateFin(format(endDate, 'yyyy-MM-dd'));
//             } else {
//                 setDateFin('');
//             }
//         } catch (error) {
//             console.error("Error calculating date de fin:", error);
//             setDateFin('');
//         }
//     };

//   // Fonctions de validation supplémentaires  
// const validateStartDate = (stoppage, currentIndex) => {  
//     if (!stoppage.startDate) return true;  
//     const projectStartDate = parseISO(dateDemarrage);  
//     const stoppageStartDate = parseISO(stoppage.startDate);  
//     return stoppageStartDate >= projectStartDate;  
// };  

// const validateEndDate = (stoppage, currentIndex) => {  
//     if (!stoppage.startDate || !stoppage.endDate) return true;  
//     const stoppageStartDate = parseISO(stoppage.startDate);  
//     const stoppageEndDate = parseISO(stoppage.endDate);  
//     return stoppageEndDate > stoppageStartDate;  
// };  




// const handleStoppageChange = (index, field, value) => {
//     const updatedStoppages = [...workStoppages];
//     const currentStoppage = { ...updatedStoppages[index] };

//     // Mise à jour du champ spécifique
//     currentStoppage[field] = value;

//     // Validation des dates
//     const isValidStoppage = validateStoppageDates(currentStoppage, index);

//     if (isValidStoppage) {
//         // Calculer la durée et le mois d'arrêt si les dates changent
//         if (field === 'startDate' || field === 'endDate') {
//             const startDate = currentStoppage.startDate ? parseISO(currentStoppage.startDate) : null;
//             const endDate = currentStoppage.endDate ? parseISO(currentStoppage.endDate) : null;
//             currentStoppage.duration = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

//             let monthOfStoppage = '';
//             if (startDate) {
//                 const startMonthYear = format(startDate,  'MMMM yyyy');
//                 if (endDate) {
//                     const endMonthYear = format(endDate,  'MMMM yyyy');
//                     monthOfStoppage = startMonthYear === endMonthYear ? startMonthYear : `${startMonthYear} - ${endMonthYear}`;
//                 } else {
//                     monthOfStoppage = startMonthYear;
//                 }
//             }
//             currentStoppage.monthOfStoppage = monthOfStoppage;
//         }
//         updatedStoppages[index] = currentStoppage;
//         setWorkStoppages(updatedStoppages);
//     } else {
//         // Optionnel : Afficher un message d'erreur
//         alert("Veuillez vérifier les dates saisies.");
//     }
// };
// const validateStoppageDates = (stoppage, currentIndex) => {  
//     // Date de démarrage du projet  
//     const projectStartDate = parseISO(dateDemarrage);  

//     // Validation de la date de début d'arrêt  
//     if (stoppage.startDate) {  
//         const stoppageStartDate = parseISO(stoppage.startDate);  
        
//         // Vérifier que la date de début d'arrêt est après la date de démarrage du projet  
//         if (stoppageStartDate < projectStartDate) {  
//             console.error("La date de début d'arrêt doit être après la date de démarrage du projet");  
//             return false;  
//         }  
//     }  

//     // Validation de la date de fin d'arrêt  
//     if (stoppage.startDate && stoppage.endDate) {  
//         const stoppageStartDate = parseISO(stoppage.startDate);  
//         const stoppageEndDate = parseISO(stoppage.endDate);  

//         // Vérifier que la date de fin est après la date de début  
//         if (stoppageEndDate <= stoppageStartDate) {  
//             console.error("La date de fin d'arrêt doit être après la date de début");  
//             return false;  
//         }  

//         // Vérifier qu'il n'y a pas de chevauchement avec les autres arrêts  
//         const overlappingStoppage = workStoppages.find((existingStoppage, index) => {  
//             if (index === currentIndex) return false; // Ignorer l'arrêt en cours de modification  

//             const existingStartDate = parseISO(existingStoppage.startDate);  
//             const existingEndDate = parseISO(existingStoppage.endDate);  

//             return (  
//                 (stoppageStartDate >= existingStartDate && stoppageStartDate <= existingEndDate) ||  
//                 (stoppageEndDate >= existingStartDate && stoppageEndDate <= existingEndDate) ||  
//                 (stoppageStartDate <= existingStartDate && stoppageEndDate >= existingEndDate)  
//             );  
//         });  

//         if (overlappingStoppage) {  
//             console.error("Chevauchement détecté avec un autre arrêt");  
//             return false;  
//         }  
//     }  

//     return true;  
// };  

// // Calcul du nombre total de jours d'arrêt  
// const calculateTotalStoppageDays = () => {  
//     return workStoppages.reduce((total, stoppage) => {  
//         if (stoppage.startDate && stoppage.endDate) {  
//             const startDate = parseISO(stoppage.startDate);  
//             const endDate = parseISO(stoppage.endDate);  
//             const days = differenceInDays(endDate, startDate) + 1; // +1 pour inclure le jour de début  
//             return total + days;  
//         }  
//         return total;  
//     }, 0);  
// };    
//     return (
//         <Container>
//             <Card>
//                 <Header>
//                     <HeaderLeft>
//                         {/* <Subtitle>GC_E02</Subtitle> */}
//                     </HeaderLeft>
//                     <HeaderRight>
//                         <Title>Gestion des Délais</Title>
//                     </HeaderRight>
//                 </Header>

//                 <FormGrid>
//                     <FormGroup>
//                         <FormLabel htmlFor="selectedProject">N° d'Affaire</FormLabel>
//                         <SelectInput
//                             id="selectedProject"
//                             value={selectedProject}
//                             onChange={handleProjectChange}
//                             options={projects.map(project => ({
//                                 value: project.id,
//                                 label: project.numProjet,
//                             }))}
//                         />
//                     </FormGroup>

//                     <FormGroup>
//                         <FormLabel htmlFor="caseTitle">Intitulé de l'Affaire</FormLabel>
//                         <FormInput
//                             type="text"
//                             id="caseTitle"
//                             name="caseTitle"
//                             value={caseTitle}
//                             readOnly
//                         />
//                     </FormGroup>
//                     <FormGroup>
//                         <FormLabel htmlFor="startDate">Buget</FormLabel>
//                         <DateInput
//                             type="number"
//                             id="budget"
//                             name="budget"
//                             value={budget}
//                             readOnly
//                         />
//                     </FormGroup>



//                 </FormGrid>

//                 {/* Buttons to toggle Work Progress and Stoppage sections */}
//                 <ButtonRow>
//                     <Button onClick={handleShowWorkProgress} className={showWorkProgress ? 'active' : ''}>
//                         Suivi Travaux
//                     </Button>
//                     <Button onClick={handleShowWorkStoppage} className={showWorkStoppage ? 'active' : ''}>
//                         Suivi Arrêt Travaux
//                     </Button>
//                 </ButtonRow>

//                 {/* Work Progress Section */}
//                 {showWorkProgress && (
//                     <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
//                         <h3>Suivi Travaux</h3>
//                         <FormGrid>


//                             <FormGroup>
//                                 <FormLabel htmlFor="startDate">Date de Démarrage des Travaux</FormLabel>
//                                 <DateInput
//                                     type="date"
//                                     id="dateDemarrage"
//                                     name="dateDemarrage"
//                                     value={dateDemarrage}
//                                     readOnly
                                   
//                                 />
//                             </FormGroup>

//                             <FormGroup>
//                                 <FormLabel htmlFor="delais">Délai Contractuel (jours)</FormLabel>
//                                 <DateInput
//                                     type="number"
//                                     id="delais"
//                                     name="delais"
//                                     value={delais}

//                                   readOnly
//                                 />
//                             </FormGroup>
//                             <FormGroup>
//                                 <FormLabel htmlFor="startDate"> Date de Fin Contractuelle</FormLabel>
//                                 <DateInput
//                                     type="date"
//                                     id="dateFin"
//                                     name="dateFin"
//                                     value={dateFin}
//                                     readOnly
//                                 />
//                             </FormGroup>
                          
//                             <FormGroup>
//                                 <FormLabel htmlFor="dateFinReelle">Date de Fin Réelle</FormLabel>
//                                 <DateInput
//                                     type="date"
//                                     id="dateFinReelle"
//                                     name="dateFinReelle"
//                                     value={dateFinReelle}
//                                     readOnly
//                                 />
//                             </FormGroup>
                           
//                         </FormGrid>
//                     </div>
//                 )}





// {showWorkStoppage && (  
//     <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>  
//         <h3>Suivi Arrêt Travaux</h3>  
//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>  
//             <thead>  
//                 <tr style={{ backgroundColor: '#f2f2f2' }}>  
//                     <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date d' arrêt</th>  
//                     <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date de reprise</th>  
//                     <th style={{ padding: '10px', border: '1px solid #ddd' }}>Durée (jours)</th>  
//                     <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mois d'arrêt</th> 

//                     <th style={{ padding: '10px', border: '1px solid #ddd' }}>objetde l'Arrêt</th>  
//                     <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>  
//                 </tr>  
//             </thead>  
//             <tbody>  
//                 {workStoppages.map((stoppage, index) => {  
//                     // Calculer la durée automatiquement  
//                     const duration = stoppage.startDate && stoppage.endDate   
//                         ? differenceInDays(  
//                             parseISO(stoppage.endDate),   
//                             parseISO(stoppage.startDate)  
//                         ) + 1   
//                         : 0;  

//                     return (  
//                         <tr key={index} style={{   
//                             backgroundColor:   
//                                 !validateStoppageDates(stoppage, index)   
//                                     ? '#ffeeee'   
//                                     : 'transparent'   
//                         }}>  
//                             <td style={{ padding: '10px', border: '1px solid #ddd' }}>  
//                                 <DateInput  
//                                     type="date"  
//                                     min={format(parseISO(dateDemarrage), 'yyyy-MM-dd')}  
//                                     value={stoppage.startDate}  
//                                     onChange={(e) => handleStoppageChange(index, 'startDate', e.target.value)}  
//                                     style={{   
//                                         width: '100%',  
//                                         border: validateStartDate(stoppage, index)   
//                                             ? '1px solid #ccc'   
//                                             : '2px solid red'  
//                                     }}  
//                                 />  
//                             </td>  
//                             <td style={{ padding: '10px', border: '1px solid #ddd' }}>  
//                                 <DateInput  
//                                     type="date"  
//                                     min={stoppage.startDate || format(parseISO(dateDemarrage), 'yyyy-MM-dd')}  
//                                     value={stoppage.endDate}  
//                                     onChange={(e) => handleStoppageChange(index, 'endDate', e.target.value)}  
//                                     style={{   
//                                         width: '100%',  
//                                         border: validateEndDate(stoppage, index)   
//                                             ? '1px solid #ccc'   
//                                             : '2px solid red'  
//                                     }}  
//                                 />  
//                             </td>  
//                             <td style={{ padding: '10px', border: '1px solid #ddd' }}>  
//                                 <FormInput  
//                                     type="number"  
//                                     value={duration}  
//                                     handleInputChange
//                                     readOnly  
//                                     style={{ width: '100%' }}  
//                                 />  
//                             </td> 
//                             <td style={{ padding: '10px', border: '1px solid #ddd' }}> 
//                             <FormInput  
//                                     type="text"  
                                   
//                                     value= {stoppage.monthOfStoppage}
//                                     onChange={(e) => handleStoppageChange(index, 'monthOfStoppage', e.target.value)}  
//                                     style={{ width: '100%' }}  
//                                 /> 
                   
//                 </td> 


//                             <td style={{ padding: '10px', border: '1px solid #ddd' }}>  
//                                 <FormInput  
//                                     type="text"  
//                                     placeholder="Motif de l'arrêt"  
//                                     value={stoppage.reason}  
//                                     onChange={(e) => handleStoppageChange(index, 'reason', e.target.value)}  
//                                     style={{ width: '100%' }}  
//                                 />  
//                             </td>  
//                             <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>  
//                                 {workStoppages.length > 1 && (  
//                                     <Button   
//                                         onClick={() => handleRemoveStoppage(index)}  
//                                         style={{   
//                                             backgroundColor: 'red',   
//                                             color: 'white',   
//                                             border: 'none',  
//                                             padding: '5px 10px',  
//                                             borderRadius: '3px'  
//                                         }}  
//                                     >  
//                                         Supprimer  
//                                     </Button>  
//                                 )}  
//                             </td>  
//                         </tr>  
//                     );  
//                 })}  
//             </tbody>  
//         </table>  

//         {/* Section pour afficher le total des jours d'arrêt */}  
//         <div style={{   
//             marginTop: '15px',   
//             padding: '10px',   
//             backgroundColor: '#f9f9f9',   
//             borderRadius: '5px'   
//         }}>  
//             <strong>Total des jours d'arrêt : {calculateTotalStoppageDays()}</strong>  
//         </div>  

//         <Button   
//             onClick={handleAddStoppage}  
//             style={{   
//                 marginTop: '10px',   
//                 backgroundColor: 'green',   
//                 color: 'white',   
//                 border: 'none',  
//                 padding: '8px 15px',  
//                 borderRadius: '5px'  
//             }}  
//         >  
//             Ajouter un Arrêt  
//         </Button>  
//     </div>  
// )}  



//                 <ButtonRow style={{ marginTop: '20px',direction:'rtl',padding:" 120px 0px 0px 0px" }}>
//                     <Button onClick={handleSaveDeadline}>Enregistrer</Button>
                   
                   
//                 </ButtonRow>
//             </Card>
//         </Container>
//     );
// };

// export default DeadlineManagementCard;


import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    Container, Card, Header, HeaderLeft, Subtitle, HeaderRight, Title,
    FormGrid, FormGroup, FormLabel, FormInput, ButtonRow, Button,
    DateInput,
} from '../Styled';
import { addDays, parseISO, format, differenceInDays } from 'date-fns';
import SelectInput from '../FicheProjet/SelectInput';

const DeadlineManagementCard = () => {
    // États pour les données du projet (remplis automatiquement)
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [projectData, setProjectData] = useState({
        bank: '',
        budget: '',
        dateApprobation: '',
        dateDemarrage: '',
        delais: '',
        description: '',
        nomProjet: '',
        numProjet: '',
        tva: ''
    });

    // États pour les champs à remplir manuellement
    const [workStoppages, setWorkStoppages] = useState([
        { startDate: '', endDate: '', reason: '', monthOfStoppage: '', duration: 0 }
    ]);
    const [dateFinContractuelle, setDateFinContractuelle] = useState('');
    const [dateFinReelle, setDateFinReelle] = useState('');
    const [showWorkStoppage, setShowWorkStoppage] = useState(true);

    // Charger les projets
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsCollection = collection(db, 'projects');
                const projectSnapshot = await getDocs(projectsCollection);
                const projectList = projectSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projectList);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjects();
    }, []);

    // Mettre à jour les données quand un projet est sélectionné
    const handleProjectChange = (event) => {
        const selectedProjectId = event.target.value;
        setSelectedProject(selectedProjectId);
        
        const foundProject = projects.find(project => project.id === selectedProjectId);
        if (foundProject) {
            // Remplir automatiquement les champs du projet
            setProjectData({
                bank: foundProject.bank || '',
                budget: foundProject.budget || '',
                dateApprobation: foundProject.dateApprobation || '',
                dateDemarrage: foundProject.dateDemarrage || '',
                delais: foundProject.delais || '',
                description: foundProject.description || '',
                nomProjet: foundProject.nomProjet || '',
                numProjet: foundProject.numProjet || '',
                tva: foundProject.tva || ''
            });

            // Calculer la date de fin contractuelle
            if (foundProject.dateDemarrage && foundProject.delais) {
                const startDate = parseISO(foundProject.dateDemarrage);
                const endDate = addDays(startDate, parseInt(foundProject.delais));
                const formattedEndDate = format(endDate, 'yyyy-MM-dd');
                setDateFinContractuelle(formattedEndDate);
                setDateFinReelle(formattedEndDate); // Initialement identique
            }
        } else {
            // Réinitialiser si aucun projet sélectionné
            setProjectData({
                bank: '',
                budget: '',
                dateApprobation: '',
                dateDemarrage: '',
                delais: '',
                description: '',
                nomProjet: '',
                numProjet: '',
                tva: ''
            });
            setDateFinContractuelle('');
            setDateFinReelle('');
        }
    };

    // Gestion des arrêts de travail
    const handleStoppageChange = (index, field, value) => {
        const updatedStoppages = [...workStoppages];
        updatedStoppages[index][field] = value;

        // Calcul automatique de la durée et du mois si les dates changent
        if (field === 'startDate' || field === 'endDate') {
            const start = updatedStoppages[index].startDate ? parseISO(updatedStoppages[index].startDate) : null;
            const end = updatedStoppages[index].endDate ? parseISO(updatedStoppages[index].endDate) : null;

            if (start && end) {
                // Calcul de la durée en jours
                const duration = differenceInDays(end, start) + 1;
                updatedStoppages[index].duration = duration;

                // Formatage du mois d'arrêt
                const startMonth = format(start, 'MMMM yyyy');
                const endMonth = format(end, 'MMMM yyyy');
                updatedStoppages[index].monthOfStoppage = startMonth === endMonth 
                    ? startMonth 
                    : `${startMonth} - ${endMonth}`;
            }
        }

        setWorkStoppages(updatedStoppages);
    };

    // Calcul de la date de fin réelle avec les arrêts
    useEffect(() => {
        if (dateFinContractuelle && workStoppages.some(stoppage => stoppage.startDate && stoppage.endDate)) {
            let totalDays = 0;
            workStoppages.forEach(stoppage => {
                if (stoppage.startDate && stoppage.endDate) {
                    totalDays += differenceInDays(
                        parseISO(stoppage.endDate), 
                        parseISO(stoppage.startDate)
                    ) + 1;
                }
            });

            const newDate = addDays(parseISO(dateFinContractuelle), totalDays);
            setDateFinReelle(format(newDate, 'yyyy-MM-dd'));
        }
    }, [workStoppages, dateFinContractuelle]);

    // Enregistrement
    const handleSaveDeadline = async () => {
        try {
            const deadlineData = {
                projectId: selectedProject,
                projectName: projectData.nomProjet,
                projectNumber: projectData.numProjet,
                initialEndDate: dateFinContractuelle,
                actualEndDate: dateFinReelle,
                workStoppages: workStoppages.filter(stoppage => 
                    stoppage.startDate && stoppage.endDate
                ),
                totalDelayDays: differenceInDays(
                    parseISO(dateFinReelle),
                    parseISO(dateFinContractuelle)
                ),
                createdAt: new Date()
            };

            await addDoc(collection(db, 'deadlines'), deadlineData);
            alert('Délais enregistrés avec succès!');
        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            alert("Erreur lors de l'enregistrement des délais");
        }
    };

    return (
        <Container>
            <Card>
                <Header>
                    <HeaderRight>
                        <Title>Gestion des Délais</Title>
                    </HeaderRight>
                </Header>

                <FormGrid>
                    {/* Section projet (champs automatiques) */}
                    <FormGroup>
                        <FormLabel>N° d'Affaire</FormLabel>
                        <SelectInput
                            value={selectedProject}
                            onChange={handleProjectChange}
                            options={projects.map(p => ({ 
                                value: p.id, 
                                label: `${p.numProjet} - ${p.nomProjet}` 
                            }))}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Nom du Projet</FormLabel>
                        <FormInput value={projectData.nomProjet} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Description</FormLabel>
                        <FormInput value={projectData.description} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Budget (TND)</FormLabel>
                        <FormInput value={projectData.budget} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Banque</FormLabel>
                        <FormInput value={projectData.bank} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>TVA (%)</FormLabel>
                        <FormInput value={projectData.tva} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Date Approbation</FormLabel>
                        <DateInput value={projectData.dateApprobation} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Date Démarrage</FormLabel>
                        <DateInput value={projectData.dateDemarrage} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Délai Contractuel (jours)</FormLabel>
                        <FormInput value={projectData.delais} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Date Fin Contractuelle</FormLabel>
                        <DateInput value={dateFinContractuelle} readOnly />
                    </FormGroup>
                </FormGrid>

                {/* Section arrêts de travail (champs manuels) */}
                <div style={{ marginTop: '20px' }}>
                    <h3>Gestion des Arrêts de Travaux</h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date Début</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date Fin</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Durée (jours)</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mois</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Motif</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workStoppages.map((stoppage, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <DateInput
                                            type="date"
                                            value={stoppage.startDate}
                                            onChange={(e) => handleStoppageChange(index, 'startDate', e.target.value)}
                                            min={projectData.dateDemarrage}
                                        />
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <DateInput
                                            type="date"
                                            value={stoppage.endDate}
                                            onChange={(e) => handleStoppageChange(index, 'endDate', e.target.value)}
                                            min={stoppage.startDate || projectData.dateDemarrage}
                                        />
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <FormInput
                                            type="number"
                                            value={stoppage.duration}
                                            readOnly
                                        />
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <FormInput
                                            value={stoppage.monthOfStoppage}
                                            readOnly
                                        />
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <FormInput
                                            value={stoppage.reason}
                                            onChange={(e) => handleStoppageChange(index, 'reason', e.target.value)}
                                            placeholder="Raison de l'arrêt"
                                        />
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        {workStoppages.length > 1 && (
                                            <Button 
                                                onClick={() => setWorkStoppages(workStoppages.filter((_, i) => i !== index))}
                                                style={{ backgroundColor: '#ff4444', color: 'white' }}
                                            >
                                                Supprimer
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Button 
                        onClick={() => setWorkStoppages([...workStoppages, { startDate: '', endDate: '', reason: '', monthOfStoppage: '', duration: 0 }])}
                        style={{ backgroundColor: '#4CAF50', color: 'white' }}
                    >
                        Ajouter un Arrêt
                    </Button>
                </div>

                {/* Section résultat (calculée automatiquement) */}
                <FormGrid style={{ marginTop: '20px' }}>
                    <FormGroup>
                        <FormLabel>Date Fin Réelle</FormLabel>
                        <DateInput value={dateFinReelle} readOnly />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Retard Total (jours)</FormLabel>
                        <FormInput 
                            value={dateFinContractuelle && dateFinReelle 
                                ? differenceInDays(parseISO(dateFinReelle), parseISO(dateFinContractuelle))
                                : '0'
                            } 
                            readOnly 
                        />
                    </FormGroup>
                </FormGrid>

                <ButtonRow style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                    <Button 
                        onClick={handleSaveDeadline}
                        style={{ backgroundColor: '#2196F3', color: 'white', padding: '10px 20px' }}
                    >
                        Enregistrer les Délais
                    </Button>
                </ButtonRow>
            </Card>
        </Container>
    );
};

export default DeadlineManagementCard;
