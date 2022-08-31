import express from 'express';
import cors from 'cors';
import path from "path";
import dotenv from 'dotenv';
import router from "./routes/router";
import { updateCoinsData } from "./utils/cron-jobs";
import { connectToDatabases } from "./connections/database";

const app = express();
const config = require('./config/config');

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: config.config.production.origin,
    credentials: true
}));

dotenv.config();

app.get('/', (req:any, res:any) => { return res.status(200).json({ message: 'success' }) });

app.use(router)

app.listen(process.env.PORT, () => {
    console.warn('server is running on PORT: ', process.env.PORT)
});

connectToDatabases()

updateCoinsData()

