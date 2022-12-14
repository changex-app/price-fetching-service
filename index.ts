import express from 'express';
import cors from 'cors';
import path from "path";
import dotenv from 'dotenv';
dotenv.config();

import router from "./routes/router";
import { connectToDatabases } from "./connections/database";
import logger from "./utils/logger";
import { PORT } from "./config/config";

const app = express();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/', (req:any, res:any) => { return res.status(200).json({ message: 'success' }) });

app.use(router)

app.listen(PORT, () => {
    logger.info(`server is running on PORT: ${PORT}`);
});

connectToDatabases()


