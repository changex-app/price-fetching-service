import mongoose from "mongoose";
import CurrencyMarket from "../models/currencyMarket";
import CurrencyHistory from "../models/currencyHistory";
import { getCoinsCodeStringByValue } from "../enums/coin-enums";
import { addNewCurrencyMarketCoin, requestMarketsCoingeckoData } from "../services/coins.market.service";
import { initailUpdateOfTheDatabase } from "../services/coins.history.service";
import { updateCoinsData } from "../utils/cron-jobs";

export async function connectToDatabases() {
    const dbUrl = process.env.DATABASE_URL;

    mongoose.connect(dbUrl!, {
        dbName: process.env.DATABASE_NAME
    })
        .then((res) => {
            console.log('database connected');
            checkMarketAndHistoryDatabase();
            updateCoinsData();
        })
        .catch((error) => {
            console.log('database error', error);
        });
}

async function checkMarketAndHistoryDatabase() {
    let currencyMarket = await CurrencyMarket.find({}),
        currencyHistory = await CurrencyHistory.find({});

    if(currencyMarket && currencyMarket.length == 0) {
        let coinsArr = await getCoinsCodeStringByValue(),
            data = await requestMarketsCoingeckoData(coinsArr);

        for (const item of data) {
           await addNewCurrencyMarketCoin(item)
        }
    }

    if( currencyHistory && currencyHistory.length == 0 ) {
        let coinsEnumArr = await getCoinsCodeStringByValue();

        await initailUpdateOfTheDatabase(coinsEnumArr);
    }
}
