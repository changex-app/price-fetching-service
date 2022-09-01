import mongoose from "mongoose";
import CurrencyMarket from "../models/currencyMarket";
import CurrencyHistory from "../models/currencyHistory";
import {getCoinsCodeStringByValue} from "../enums/coin-enums";
import {addNewCurrencyMarketCoin, requestMarketsCoingeckoData} from "../services/coins.market.service";
import {initailUpdateOfTheDatabase} from "../services/coins.history.service";

export async function connectToDatabases() {
    const dbUrl = process.env.DATABASE_URL;

    mongoose.connect(dbUrl!, {
        dbName: process.env.DATABASE_NAME
    })
        .then((res) => {
            console.log('database connected');
            checkMarketAndHistoryDatabase();
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
            url = `${process.env.COINGECKO_API_URL}coins/markets?ids=${coinsArr.join('%2C')}&vs_currency=usd`,
            data = await requestMarketsCoingeckoData(url);
        console.warn('checkMarketAndHistoryDatabase');
        data.forEach((item: any)=> {
            addNewCurrencyMarketCoin(item)
        })
    }

    if( currencyHistory && currencyHistory.length == 0 ) {
        let coinsEnumArr = await getCoinsCodeStringByValue();

        await initailUpdateOfTheDatabase(coinsEnumArr);
    }
}
