import express from "express";
import { allCategories, createCategory, deleteCategory, detailCategory, updateCategory } from "../controllers/c_categories.js";
import { admin, authentication } from "../middleware/auth.js";

const Router = express.Router();

Router.post('/category/create', authentication, admin, createCategory);
Router.get('/category', authentication, admin, allCategories);
Router.get('/category/detail/:id', authentication, admin, detailCategory);
Router.put('/category/update/:id', authentication, admin, updateCategory);
Router.delete('/category/delete/:id', authentication, admin, deleteCategory);

export default Router;