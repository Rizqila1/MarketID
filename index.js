import express from "express";
import cors from "cors";
import { PORT } from './src/config/secret.js'

// Import Routers
import r_users from "./src/routers/r_users.js";
import r_roles from "./src/routers/r_roles.js";
import r_categories from "./src/routers/r_categories.js";
import r_products from "./src/routers/r_products.js";
import r_checkout from "./src/routers/r.checkout.js";
import r_address from "./src/routers/r_address.js";


const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb'}))
app.use(express.urlencoded({ extended: true, limit: "5mb"}))

// Routers
app.use("/api/v1", r_users);
app.use("/api/v1", r_roles);
app.use("/api/v1", r_categories);
app.use("/api/v1", r_products);
app.use("/api/v1", r_checkout);
app.use("/api/v1", r_address);

// Default Page
app.use('/', (req, res) => {
  res.status(200).send({
    message: "404 Page",
  });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));