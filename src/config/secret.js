import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3002;
const URL_DB = process.env.URL_DB;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const SECRET_KEY = process.env.SECRET_KEY;
const API_REGION_IDN = process.env.API_REGION_IDN;

export {
  PORT,
  URL_DB,
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  SECRET_KEY,
  API_REGION_IDN,
};
