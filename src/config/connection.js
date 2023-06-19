import mongoose from "mongoose";
import { URL_DB } from "./secret.js";


try {
  mongoose.connect(URL_DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("Connected to db success");
} catch (error) {
  handleError(error);
};

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error.message);
});

export default mongoose;