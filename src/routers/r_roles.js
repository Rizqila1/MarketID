import express from "express";
import { allRoles, createRole, deleteRole, detailRole, updateRole } from "../controllers/c_roles.js";
import { admin, authentication } from "../middleware/auth.js";

const Router = express.Router();

Router.post('/roles/create', authentication, admin, createRole);
Router.get('/roles', authentication, admin, allRoles);
Router.get('/roles/detail/:id', authentication, admin, detailRole);
Router.put('/roles/update/:id', authentication, admin, updateRole);
Router.delete('/roles/delete/:id', authentication, admin, deleteRole);

export default Router;