import express from "express";
import { allUsers, deleteUser, detailUser, loginUser, logoutUser, registerUser, updateUser } from "../controllers/c_users.js";
import { authentication, admin } from "../middleware/auth.js";
import uploadImg from "../middleware/upload_img.js";

const Router = express.Router();

Router.get('/users', authentication, admin, allUsers);
Router.post('/users/register', registerUser);
Router.post('/users/login', loginUser);
Router.post('/users/logout/:id', authentication, logoutUser);
Router.get('/users/details/:id', authentication, detailUser);
Router.put('/users/update/:id', authentication, uploadImg, updateUser);
Router.delete('/users/delete/:id', authentication, admin, deleteUser);

export default Router;