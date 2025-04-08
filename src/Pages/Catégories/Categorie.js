import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./categorie.css";

function Categories() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    designation: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);

  // Fonction pour récupérer les catégories depuis Firestore
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoryList);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({ designation: category.designation });
    } else {
      setEditingCategory(null);
      setNewCategory({ designation: "" });
    }
    setIsCategoryModalOpen(true);
  };
  
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Gérer les changements dans le formulaire
  const handleChangeCategory = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  // Ajouter ou modifier une catégorie
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), newCategory);
        console.log("Catégorie mise à jour avec succès !");
      } else {
        await addDoc(collection(db, "categories"), newCategory);
        console.log("Catégorie ajoutée avec succès !");
      }
      closeCategoryModal();
      fetchCategories();
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification :", error);
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      console.log("Catégorie supprimée !");
      fetchCategories();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  return (
    <div className="categories-container">
      <div className="categories-details">
        <div className="categories-header">
          <h2>Catégories</h2>
          <button className="categories-btn" onClick={() => openCategoryModal()}>+ Nouvelle Catégorie</button>
        </div>

        {/* Tableau des catégories */}
        <table className="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Désignation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.designation}</td>
                <td>
                  <button className="edit-btn" onClick={() => openCategoryModal(category)}>
                    <FaEdit />
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteCategory(category.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour ajouter/modifier une catégorie */}
      {isCategoryModalOpen && (
        <div className="categories-modal">
          <div className="categories-modal-content">
            <span className="categories-close" onClick={closeCategoryModal}>&times;</span>
            <h3>{editingCategory ? "Modifier la catégorie" : "Ajouter une nouvelle catégorie"}</h3>
            <form onSubmit={handleSubmitCategory}>
              <input type="text" name="designation" placeholder="Désignation" value={newCategory.designation} onChange={handleChangeCategory} required />
              <div className="modal-footer" style={{ display: "flex", gap: "10px" }}>
              <button className="add-btn" type="submit">{editingCategory ? "Modifier" : "Ajouter"}</button>

              <button className="close-btn_2" type="button" onClick={closeCategoryModal}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

export default Categories;
