import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    Container, Card, Header, HeaderLeft, Subtitle, HeaderRight, Title,
    FormGrid, FormGroup, FormLabel, FormInput, ButtonRow, Button,
    DateInput,
} from '../Styled';
import SelectInput from '../FicheProjet/SelectInput';

const DeadlineManagementCard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [caseTitle, setCaseTitle] = useState('');
    const[budget,setBugetProjet]=useState("")
    const[dateDemarrage,setDateDemarrage]=useState("")
    const[delais,setDelais]=useState("")
    const[dateFin,setDateFin]=useState()
    const [startDate, setStartDate] = useState('');
    
    const [contractualDeadline, setContractualDeadline] = useState('');
    const [contractualEndDate, setContractualEndDate] = useState('');
    const [actualEndDate, setActualEndDate] = useState('');
    const [observation, setObservation] = useState('');
    const [showWorkProgress, setShowWorkProgress] = useState(false);
    const [showWorkStoppage, setShowWorkStoppage] = useState(false);

    // State for Work Progress fields
    const [progressDate, setProgressDate] = useState('');
    const [progressDescription, setProgressDescription] = useState('');
    const [progressPercentage, setProgressPercentage] = useState('');

    // State for Work Stoppage fields
    const [stoppageStartDate, setStoppageStartDate] = useState('');
    const [stoppageEndDate, setStoppageEndDate] = useState('');
    const [stoppageReason, setStoppageReason] = useState('');


    const [workStoppages, setWorkStoppages] = useState([
        {
            authorizationNumber: '',
            authorizationIdentifier: '',
            notificationDate: '',
            issuanceDate: '',
            startDate: '',
            endDate: '',
            duration: '',
            reason: '',
        },
    ]);

    useEffect(() => {
        // ... (your existing useEffect for fetching projects)
        const fetchProjects = async () => {
            try {
                const projectsCollection = collection(db, 'projects');
                const projectSnapshot = await getDocs(projectsCollection);
                const projectList = projectSnapshot.docs.map(doc => ({
                    id: doc.id,
                    numProjet: doc.data().numProjet,
                    description: doc.data().description,
                    budget:doc.data().budget,
                    dateDemarrage:doc.data().dateDemarrage,
                    delais:doc.data().delais,

                }));
                setProjects(projectList);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, []);

    const handleProjectChange = (event) => {
        const selectedProjectId = event.target.value;
        setSelectedProject(selectedProjectId);
        const foundProject = projects.find(project => project.id === selectedProjectId);
        if (foundProject) {
            setCaseTitle(foundProject.description);
            setBugetProjet(foundProject.budget)
            setDateDemarrage(foundProject.dateDemarrage)
            setDelais(foundProject.delais)

            console.log("le delais est ",foundProject.delais)

        } else {
            setCaseTitle('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
           
           
            case 'startDate':
                setStartDate(value);
                break;
            case 'contractualDeadline':
                setContractualDeadline(value);
                break;
            case 'actualEndDate':
                setActualEndDate(value);
                break;
            case 'observation':
                setObservation(value);
                break;
            // Work Progress fields
            case 'progressDate':
                setProgressDate(value);
                break;
            case 'progressDescription':
                setProgressDescription(value);
                break;
            case 'progressPercentage':
                setProgressPercentage(value);
                break;
            // Work Stoppage fields
            case 'stoppageStartDate':
                setStoppageStartDate(value);
                break;
            case 'stoppageEndDate':
                setStoppageEndDate(value);
                break;
            case 'stoppageReason':
                setStoppageReason(value);
                break;
            default:
                break;
        }
    };

    const handleShowWorkProgress = () => {
        setShowWorkProgress(true);
        setShowWorkStoppage(false);
    };

    const handleShowWorkStoppage = () => {
        setShowWorkProgress(false);
        setShowWorkStoppage(true);
    };

    const handleSaveDeadline = () => {
        // Include logic to save work progress and stoppage data if they are shown
        const deadlineData = {
            selectedProject,
            caseTitle,
           
            startDate,
            contractualDeadline,
            contractualEndDate,
            actualEndDate,
            observation,
        };

        if (showWorkProgress) {
            deadlineData.workProgress = {
                dateDemarrage: dateDemarrage,
                delais:delais,

                description: progressDescription,
                percentage: progressPercentage,
            };
        }

        if (showWorkStoppage) {
            deadlineData.workStoppage = {
                startDate: stoppageStartDate,
                endDate: stoppageEndDate,
                reason: stoppageReason,
            };
        }

        console.log("Deadline Data to Save:", deadlineData);
        alert('Deadline and related data saved!');
    };

    const handleCancel = () => {
        navigate('/some-other-page');
    };
    const handleAddStoppage = () => {
        setWorkStoppages([
            ...workStoppages,
            {
                authorizationNumber: '',
                authorizationIdentifier: '',
                notificationDate: '',
                issuanceDate: '',
                startDate: '',
                endDate: '',
                duration: '',
                reason: '',
            },
        ]);
    };

    const handleRemoveStoppage = (index) => {
        const updatedWorkStoppages = workStoppages.filter((_, i) => i !== index);
        setWorkStoppages(updatedWorkStoppages);
    };

    return (
        <Container>
            <Card>
                <Header>
                    <HeaderLeft>
                        <Subtitle>GC_E02</Subtitle>
                    </HeaderLeft>
                    <HeaderRight>
                        <Title>Gestion des Délais</Title>
                    </HeaderRight>
                </Header>

                <FormGrid>
                    <FormGroup>
                        <FormLabel htmlFor="selectedProject">N° d'Affaire</FormLabel>
                        <SelectInput
                            id="selectedProject"
                            value={selectedProject}
                            onChange={handleProjectChange}
                            options={projects.map(project => ({
                                value: project.id,
                                label: project.numProjet,
                            }))}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="caseTitle">Intitulé de l'Affaire</FormLabel>
                        <FormInput
                            type="text"
                            id="caseTitle"
                            name="caseTitle"
                            value={caseTitle}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel htmlFor="startDate">Buget</FormLabel>
                        <DateInput
                            type="number"
                            id="budget"
                            name="budget"
                            value={budget}
                            readOnly
                        />
                    </FormGroup>



                </FormGrid>

                {/* Buttons to toggle Work Progress and Stoppage sections */}
                <ButtonRow>
                    <Button onClick={handleShowWorkProgress} className={showWorkProgress ? 'active' : ''}>
                        Suivi Travaux
                    </Button>
                    <Button onClick={handleShowWorkStoppage} className={showWorkStoppage ? 'active' : ''}>
                        Suivi Arrêt Travaux
                    </Button>
                </ButtonRow>

                {/* Work Progress Section */}
                {showWorkProgress && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                        <h3>Suivi Travaux</h3>
                        <FormGrid>


                            <FormGroup>
                                <FormLabel htmlFor="startDate">Date de Démarrage des Travaux</FormLabel>
                                <DateInput
                                    type="date"
                                    id="dateDemarrage"
                                    name="dateDemarrage"
                                    value={dateDemarrage}
                                    readOnly
                                   
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel htmlFor="startDate"> Date de Fin Contractuelle</FormLabel>
                                <DateInput
                                    type="date"
                                    id="dateFin"
                                    name="dateFin"
                                    value={dateFin}
                                    readOnly
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel htmlFor="delais">Délai Contractuel (jours)</FormLabel>
                                <DateInput
                                    type="number"
                                    id="delais"
                                    name="delais"
                                    value={delais}

                                  readOnly
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel htmlFor="startDate">Date de Fin Réelle</FormLabel>
                                <DateInput
                                    type="number"
                                    id="startDate"
                                    name="startDate"
                                    value={startDate}
                                    onChange={handleInputChange}
                                />
                            </FormGroup>
                           
                        </FormGrid>
                    </div>
                )}


                
                {/* Work Stoppage Section */}
                {showWorkStoppage && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                        <h3>Suivi Arrêt Travaux</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>رقم الإذن</th>
                                    <th>معرف الإذن</th>
                                    <th>تاريخ الإشعار</th>
                                    <th>تاريخ الإصدار</th>
                                    <th>يبدأ من</th>
                                    <th>إلى</th>
                                    <th>المدة</th>
                                    <th>موضوعه</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workStoppages.map((stoppage, index) => (
                                    <tr key={index}>
                                        <td>
                                            <FormInput
                                                type="text"
                                                name={`authorizationNumber-${index}`}
                                                value={stoppage.authorizationNumber}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <FormInput
                                                type="text"
                                                name={`authorizationIdentifier-${index}`}
                                                value={stoppage.authorizationIdentifier}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <DateInput
                                                type="date"
                                                name={`notificationDate-${index}`}
                                                value={stoppage.notificationDate}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <DateInput
                                                type="date"
                                                name={`issuanceDate-${index}`}
                                                value={stoppage.issuanceDate}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <DateInput
                                                type="date"
                                                name={`startDate-${index}`}
                                                value={stoppage.startDate}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <DateInput
                                                type="date"
                                                name={`endDate-${index}`}
                                                value={stoppage.endDate}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <FormInput
                                                type="text"
                                                name={`duration-${index}`}
                                                value={stoppage.duration}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <FormInput
                                                type="text"
                                                name={`reason-${index}`}
                                                value={stoppage.reason}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            {workStoppages.length > 1 && (
                                                <Button onClick={() => handleRemoveStoppage(index)}>Supprimer</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Button onClick={handleAddStoppage}>Ajouter un Arrêt</Button>
                    </div>
                )}
                <ButtonRow style={{ marginTop: '20px',direction:'rtl',padding:" 120px 0px 0px 0px" }}>
                    <Button onClick={handleSaveDeadline}>Enregistrer</Button>
                    <Button onClick={handleCancel}>Annuler</Button>
                    <Button onClick={() => navigate('/FirstPage')}>Home</Button>
                </ButtonRow>
            </Card>
        </Container>
    );
};

export default DeadlineManagementCard;



