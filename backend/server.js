//require dotenv to import .env file its always will on top
import dotenv from "dotenv";
dotenv.config();

//requires express and Initialize the express app
import express from "express"
const app = express();

//define the port
const port = process.env.PORT || 8000;

import path from "path"
import { fileUrlToPath } from "url"

// require mongoose to Connect with the database
import mongoose from "mongoose";

if (process.env.NODE_ENV == "development") {
    mongoose.connect(process.env.MONGO_DEV_URI)
        .then(() => { console.log('Connected to development db') })
        .catch((errer) => { console.log(errer) });
} else if (process.env.NODE_ENV == "production") {
    mongoose.connect(process.env.MONGO_PROD_URI)
        .then(() => { console.log('Connected to production db') })
        .catch((errer) => { console.log(errer) });
}
else {
    console.log('Testing Mongo DB connected');
}

//require cors for dependency
import cors from "cors";
app.use(cors())

// Set Image URL
app.use("/filestorage", express.static('uploads/images'));

//reuire express.json to get obj to json
app.use(express.json());

const __filename = fileUrlToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend/build')))

// Entry route
app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
})

// auth route
import authRoute from "./routes/authRoute.js";
app.use('/users', authRoute);

app.listen(port, () => {
    console.log(`listing server port: ${port}`)
})
