import axios from "axios";
import Messages from "../utils/messages.js";
import { API_REGION_IDN } from "../config/secret.js";

const provinces = (req, res) => {
  axios
    .get(`${API_REGION_IDN}/provinces.json`)
    .then((response) => {
      Messages(res, 200, "Get Data Provinces", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};

const regencies = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Province Not Found", []);

  axios
    .get(`${API_REGION_IDN}/regencies/${id}.json`)
    .then((response) => {
      Messages(res, 200, "Get Data Regencies", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};

const districts = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Regency/City Not Found", []);

  axios
    .get(`${API_REGION_IDN}/districts/${id}.json`)
    .then((response) => {
      Messages(res, 200, "Get Data Districts", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};

const villages = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID District Not Found", []);

  axios
    .get(`${API_REGION_IDN}/villages/${id}.json`)
    .then((response) => {
      Messages(res, 200, "Get Data Villages", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};

export { provinces, regencies, districts, villages };
