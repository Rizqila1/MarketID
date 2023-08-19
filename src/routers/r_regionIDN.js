import express from "express";
import {
  districts,
  provinces,
  regencies,
  villages,
} from "../controllers/c_regionIDN.js";

const Router = express.Router();

Router.get("/provinces", provinces);
Router.get("/regencies/:id", regencies);
Router.get("/districts/:id", districts);
Router.get("/villages/:id", villages);

export default Router;
