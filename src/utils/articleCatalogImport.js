import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { ARTICLE_CATALOG } from "../data/articleCatalog";

const normalizeText = (value) =>
  String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR");

const normalizeUnit = (value) => {
  const unit = String(value || "").replace(/\s+/g, "").trim();
  const normalized = unit.toLocaleLowerCase("fr-FR");
  if (normalized === "m2" || normalized === "m²") return "m2";
  if (normalized === "m3" || normalized === "m³") return "m3";
  if (normalized === "ml") return "ml";
  if (normalized === "kg") return "kg";
  if (normalized === "ens") return "Ens";
  if (normalized === "u") return "U";
  if (normalized === "t") return "T";
  return unit;
};

const categoryKey = (value) => normalizeText(value);

const articleKey = (designation, unite, categorie) =>
  [normalizeText(designation), normalizeUnit(unite), categoryKey(categorie)].join("|");

const categoryNameForArticle = (article, categoriesById) => {
  const category = categoriesById.get(article.categorie);
  return category?.designation || article.categorie || "";
};

export async function getArticleCatalogDatabaseState() {
  const [categorySnapshot, articleSnapshot] = await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "articles")),
  ]);
  return {
    categoryCount: categorySnapshot.size,
    articleCount: articleSnapshot.size,
  };
}

/**
 * Imports the bundled Excel catalogue into the existing Firestore collections.
 *
 * The operation only creates missing categories and articles. It never updates
 * or deletes existing documents, so running it again is safe and idempotent.
 */
export async function importArticleCatalog({ currentUser } = {}) {
  const [categorySnapshot, articleSnapshot] = await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "articles")),
  ]);

  const existingCategories = categorySnapshot.docs.map((categoryDoc) => ({
    id: categoryDoc.id,
    ...categoryDoc.data(),
  }));
  const existingArticles = articleSnapshot.docs.map((articleDoc) => ({
    id: articleDoc.id,
    ...articleDoc.data(),
  }));

  const categoriesByKey = new Map();
  const categoriesById = new Map();
  existingCategories.forEach((category) => {
    categoriesById.set(category.id, category);
    const key = categoryKey(category.designation);
    if (key && !categoriesByKey.has(key)) categoriesByKey.set(key, category);
  });

  const categoryIdsByKey = new Map();
  const batch = writeBatch(db);
  let createdCategories = 0;

  ARTICLE_CATALOG.categories.forEach((designation) => {
    const key = categoryKey(designation);
    const existing = categoriesByKey.get(key);
    if (existing) {
      categoryIdsByKey.set(key, existing.id);
      return;
    }

    const categoryRef = doc(collection(db, "categories"));
    categoryIdsByKey.set(key, categoryRef.id);
    categoriesById.set(categoryRef.id, { id: categoryRef.id, designation });
    categoriesByKey.set(key, { id: categoryRef.id, designation });
    batch.set(categoryRef, {
      designation,
      createdAt: serverTimestamp(),
      createdBy: currentUser?.uid || "",
      source: "LES_ARTICLES.xlsx",
    });
    createdCategories += 1;
  });

  const existingArticleKeys = new Set(
    existingArticles.map((article) =>
      articleKey(
        article.designation,
        article.unite,
        categoryNameForArticle(article, categoriesById)
      )
    )
  );
  const sourceArticleKeys = new Set();
  const skippedArticles = [];
  let newArticles = 0;
  let existingArticleCount = 0;
  let sourceDuplicateCount = 0;

  ARTICLE_CATALOG.articles.forEach((article, index) => {
    const categoryId = categoryIdsByKey.get(categoryKey(article.categorie));
    if (!categoryId) {
      skippedArticles.push({
        line: index + 1,
        designation: article.designation,
        reason: "Catégorie introuvable",
      });
      return;
    }

    const key = articleKey(article.designation, article.unite, article.categorie);
    if (sourceArticleKeys.has(key)) {
      sourceDuplicateCount += 1;
      return;
    }
    sourceArticleKeys.add(key);

    if (existingArticleKeys.has(key)) {
      existingArticleCount += 1;
      return;
    }

    const articleRef = doc(collection(db, "articles"));
    batch.set(articleRef, {
      numero: "",
      designation: article.designation,
      unite: normalizeUnit(article.unite),
      categorie: categoryId,
      createdAt: serverTimestamp(),
      createdBy: currentUser?.uid || "",
      source: "LES_ARTICLES.xlsx",
    });
    existingArticleKeys.add(key);
    newArticles += 1;
  });
  if (createdCategories + newArticles > 0) await batch.commit();

  return {
    physicalRows: 175,
    dataRows: 174,
    detectedCategories: ARTICLE_CATALOG.categories.length,
    detectedArticles: ARTICLE_CATALOG.articles.length,
    beforeCategoryCount: existingCategories.length,
    beforeArticleCount: existingArticles.length,
    createdCategories,
    newArticles,
    existingArticles: existingArticleCount,
    sourceDuplicates: sourceDuplicateCount,
    skippedArticles,
    errors: 0,
  };
}