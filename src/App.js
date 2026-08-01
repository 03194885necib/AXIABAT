import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth pages (new)
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Unauthorized from "./pages/auth/Unauthorized";

import UserManagement from "./pages/admin/UserManagement";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ROLES } from "./context/AuthContext";

// Existing pages & components
import Template from "./Pages/Template22";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Allcharts from "./Pages/Charts/Allcharts";
import Projects from "./Pages/Project/Project";
import Articles from "./Pages/Article/Article";
import Catégorie from "./Pages/Catégories/Categorie";
import Test from "./Pages/Project/test";
import AjouterProjet from "./Pages/Project2/Project2";
import ProjectForm from "./Pages/Project3/ProjectForm";
import TestProjet from "./Components/FicheProjet/TestProjet";
import FirstPage from "./Components/FirstPage/FirstPage";
import FicheProjet from "./Components/FicheProjet/FicheProjet";
import ListeArticle from "./Components/FicheProjet/ListeArticle/ListeArticle";
import MesArticles from "./Components/Articles/Articles";
import JournalCHantier from "./Components/JournalChantier/JournalCHantier.js";
import Delais from "./Components/gestion des delais/GestionDelais.js";
import Decompte from "./Components/Décompte/Décompte.js";
import DecompteForm from "./Components/Décompte/DécompteForm.js";
import Rapport from "./Components/Rapport/Rapport.js";
import ImporterRapport from "./Components/Rapport/Importer/ImportProjectPage.js";
import DashboardDelai from "./Components/Dashboard/DashboardDelai.js";
import BudgetDashboard from "./Components/Dashboard/BudgetDashboard.js";
import GlobalDash from "./Components/Dashboard/GlobalDash/GlobalDash.js";
import DashDecompte from "./Components/Dashboard/Decomptes/DécompteDash.js";
import TabComp from "./Components/Dashboard/Decomptes/TableauComparatif/TabCom.js";
import DashDelais from "./Components/gestion des delais/DashboardDeadline.js";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Protected app routes */}
      <Route
        path="/FirstPage"
        element={
          <ProtectedRoute>
            <FirstPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/TestProjet"
        element={
          <ProtectedRoute>
            <TestProjet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/FicheProjet"
        element={
          <ProtectedRoute>
            <FicheProjet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/MesArticles"
        element={
          <ProtectedRoute>
            <MesArticles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/GlobalDash"
        element={
          <ProtectedRoute>
            <GlobalDash />
          </ProtectedRoute>
        }
      />
      <Route
        path="/DashDecompte"
        element={
          <ProtectedRoute>
            <DashDecompte />
          </ProtectedRoute>
        }
      />
      <Route
        path="/TabComp"
        element={
          <ProtectedRoute>
            <TabComp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/DashDelais"
        element={
          <ProtectedRoute>
            <DashDelais />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ListeArticle"
        element={
          <ProtectedRoute>
            <ListeArticle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/JournalCHantier"
        element={
          <ProtectedRoute>
            <JournalCHantier />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Delais"
        element={
          <ProtectedRoute>
            <Delais />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Decompte"
        element={
          <ProtectedRoute>
            <Decompte />
          </ProtectedRoute>
        }
      />
      <Route
        path="/DecompteForm"
        element={
          <ProtectedRoute>
            <DecompteForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/BudgetDashboard"
        element={
          <ProtectedRoute>
            <BudgetDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/DashboardDelai"
        element={
          <ProtectedRoute>
            <DashboardDelai />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Rapport"
        element={
          <ProtectedRoute>
            <Rapport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ImporterRapport"
        element={
          <ProtectedRoute>
            <ImporterRapport />
          </ProtectedRoute>
        }
      />

      {/* Template layout with nested routes */}
      <Route
        path="/template"
        element={
          <ProtectedRoute>
            <Template />
          </ProtectedRoute>
        }
      >
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

      {/* 404 — redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
