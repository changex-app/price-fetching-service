import mongoose from "mongoose";
import logger from "../utils/logger";
import { DATABASE_NAME, DATABASE_URL } from "../config/config";
import { checkMarketAndHistoryDatabase } from "../services/database";
import { updateCoinsData } from "../utils/cron-jobs";

export async function connectToDatabases() {
    mongoose.connect(DATABASE_URL, {
        dbName: DATABASE_NAME || 'xchange_price_fetcher'
    })
        .then((res) => {
            logger.info('database connected');
            checkMarketAndHistoryDatabase();
            updateCoinsData();
        })
        .catch((error) => {
            logger.error('database error', error);
        });
}

