import express from "express";
import { allCheckout, confirmCheckout, createCheckout, deleteCheckout, detailCheckout, historyCheckout } from "../controllers/c_checkout.js";
import { admin, authentication, customer } from "../middleware/auth.js";

const Router = express.Router();

Router.post('/checkout/create', authentication, customer, createCheckout);
Router.get('/checkout/list', authentication, admin, allCheckout);
Router.get('/checkout/history/:id', authentication, customer, historyCheckout);
Router.get('/checkout/detail/:invoice', authentication, detailCheckout);
Router.put('/checkout/confirm/:invoice', authentication, customer, confirmCheckout);
Router.delete('/checkout/delete/:invoice', authentication, admin, deleteCheckout);


export default Router;