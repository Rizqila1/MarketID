import express from "express";
import { allAddress, createAddress, deleteAddress, detailAddress, updateAddress } from "../controllers/c_address.js";
import { admin, authentication, customer } from "../middleware/auth.js";

const Router = express.Router();

Router.post('/address/create', authentication, customer, createAddress);
Router.get('/address/list', authentication, customer, allAddress);
Router.get('/address/detail/:id', authentication, customer, detailAddress);
Router.put('/address/update/:id', authentication, customer, updateAddress);
Router.delete('/address/delete/:id', authentication, customer, deleteAddress);

export default Router;