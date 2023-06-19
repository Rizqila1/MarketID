import express from "express";
import { allProducts, createProduct, deleteProduct, detailProduct, updateProduct } from "../controllers/c_products.js";
import { admin, authentication } from "../middleware/auth.js";
import uploadImg from "../middleware/upload_img.js";

const Router = express.Router();

Router.get('/products', authentication, admin, allProducts);
Router.post('/products/create', authentication, admin, uploadImg, createProduct);
Router.get('/products/details/:id', authentication, detailProduct);
Router.put('/products/update/:id', authentication, admin, uploadImg, updateProduct);
Router.delete('/products/delete/:id', authentication, admin, deleteProduct);


export default Router;