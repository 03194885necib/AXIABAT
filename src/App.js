import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Template from './Pages/Template22';
import Home from './Pages/Home';
import About from './Pages/About';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import LineChart from './Pages/Charts/LineChart';
import Allcharts from './Pages/Charts/Allcharts'
import Projects from './Pages/Project/Project'
import Articles from './Pages/Article/Article';
import Catégorie from './Pages/Catégories/Categorie'
import Test from "./Pages/Project/test"
import AjouterProjet from "./Pages/Project2/Project2"
import ProjectForm from "./Pages/Project3/ProjectForm"
import TestProjet from './Components/FicheProjet/TestProjet'
import FirstPage from './Components/FirstPage/FirstPage'
import FicheProjet from './Components/FicheProjet/FicheProjet'
import ListeArticle from './Components/FicheProjet/ListeArticle/ListeArticle'
import MesArticles from './Components/Articles/Articles'
import JournalCHantier from './Components/JournalChantier/JournalCHantier.js'
import ForgetPassword from './Pages/ForgetPassword'
import Delais from './Components/gestion des delais/Delais3.js'
import Decompte from './Components/Décompte/Décompte.js'
import DecompteForm from './Components/Décompte/DécompteForm.js'
import Rapport from './Components/Rapport/Rapport.js'
import ImporterRapport from './Components/Rapport/Importer/ImportProjectPage.js'
import DashboardDelai from './Components/Dashboard/DashboardDelai.js'
import BudgetDashboard from './Components/Dashboard/BudgetDashboard.js'
import GlobalDash from './Components/Dashboard/GlobalDash/GlobalDash.js'
import DashDecompte from'./Components/Dashboard/Decomptes/DécompteDash.js'
import TabComp from './Components/Dashboard/Decomptes/TableauComparatif/TabCom.js'
import DashDelais from './Components/gestion des delais/DashboardDeadline.js'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />}></Route>

      <Route path="/Signup" element={<SignUp />}></Route>
      <Route path="/ForgetPassword" element={<ForgetPassword />}></Route>
      <Route path="/Delais" element={<Delais />} />
      <Route path="FirstPage" element={<FirstPage />} />
      <Route path="TestProjet" element={<TestProjet />} />
      <Route path="/FicheProjet" element={<FicheProjet />} />
      <Route path="/MesArticles" element={<MesArticles />} />
      <Route path="/GlobalDash" element={<GlobalDash />} />
      <Route path="/DashDecompte" element={<DashDecompte />} />

      <Route path="/TabComp" element={<TabComp />} />

      {/* Dashboards */}
       <Route path="/DashDelais" element={<DashDelais />} />

      <Route path="/ListeArticle" element={<ListeArticle />} />

      <Route path="/JournalCHantier" element={<JournalCHantier />} />
      <Route path="/Decompte" element={<Decompte />} />
      <Route path="/DecompteForm" element={<DecompteForm />} />
      <Route path="BudgetDashboard" element={<BudgetDashboard />}/> 
      <Route path="/DashboardDelai" element={<DashboardDelai />} />

      <Route path="/Rapport" element={<Rapport />} />
      <Route path="/ImporterRapport" element={<ImporterRapport />} />

      <Route path="/template" element={<Template />}>


        <Route path="home" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="AllCharts" element={<Allcharts />} />
        <Route path="Projects" element={<Projects />} />
        <Route path="Article" element={<Articles />} />
        <Route path="Catégorie" element={<Catégorie />} />
        <Route path="Test" element={<Test />} />
        <Route path="AjouterProjet" element={<AjouterProjet />} />
        <Route path="ProjectForm" element={<ProjectForm />} />



      </Route>
    </Routes>


  );
}

export default App;  