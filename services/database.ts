import CurrencyMarket from "../models/currencyMarket";
import CurrencyHistory from "../models/currencyHistory";
import { getCoinsCodeStringByValue } from "../enums/coin-enums";
import { addNewCurrencyMarketCoin, requestMarketsCoingeckoData } from "./coins.market.service";
import { initailUpdateOfTheDatabase } from "./coins.history.service";
import logger from "../utils/logger";

export async function checkMarketAndHistoryDatabase() {
    try {
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

            await initailUpdateOfTheDatabase(coinsEnumArr)
                .catch(err => {
                    throw new Error(err);
                });
        }
    } catch (err) {
        logger.error(err)
    }
}
