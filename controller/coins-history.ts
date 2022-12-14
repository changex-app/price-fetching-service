import express, {NextFunction} from "express";
import {
    addNewCurrencyHistoryCoin,
    getCoingeckoCoinsIdsFromDB,
    getCoinHistoryDataBasedOnDays
} from "../services/coins.history.service";
import logger from "../utils/logger";
import HttpException from "../classes/HttpException";

export async function getCoinHystoryData(
    req: express.Request,
    res: express.Response,
    next: NextFunction
){

    const query = req.query;

    if (!query['days'] || !query['vs_currency'] || !req.originalUrl) {
        logger.error('Missing one of params: `days, `vs_currency`, `url`');
        next(new HttpException(400, 'Missing one of params: `days, `vs_currency`, `url`'));
    }

    try {
        let coinId =  req.originalUrl.split("/")[2],
            days = query['days'],
            vs_currency = query['vs_currency'],
            coinsArrayInDB = await getCoingeckoCoinsIdsFromDB(),
            coinExists = false;

        if(coinsArrayInDB?.includes(coinId)) {
            coinExists = true
        }

        if(coinExists){
            // @ts-ignore
            await getCoinHistoryDataBasedOnDays(coinId, days.toString())
                .then((resp)=> {
                    return res.status(200).json(resp);
                });
        } else {
            let newRecord = await addNewCurrencyHistoryCoin(coinId, vs_currency)
                .catch(err => {
                    throw new Error(err);
                });

            // @ts-ignore
            await getCoinHistoryDataBasedOnDays(newRecord.id, days.toString())
                .then((resp)=>{
                    return res.status(200).json(resp);
                });
        }
    } catch (err: any) {
        next(new HttpException(500, err));
    }
}

