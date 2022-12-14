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

    const params = req.params;

    console.warn('params', req.params);

    if (!params['days'] || !params['vs_currency'] || !params['url']) {
        logger.error('Missing one of params: `days, `vs_currency`, `url`');
        next(new HttpException(400, 'Missing one of params: `days, `vs_currency`, `url`'));
    }

    try {
        let coinId =  params['url'].split("/")[2],
            days = params['days'],
            vs_currency = params['vs_currency'],
            coinsArrayInDB = await getCoingeckoCoinsIdsFromDB(),
            coinExists = false;

        if(coinsArrayInDB?.includes(coinId)) {
            coinExists = true
        }

        if(coinExists){
            await getCoinHistoryDataBasedOnDays(coinId, days.toString())
                .then((resp)=> {
                    return res.status(200).json(resp);
                });
        } else {
            let newRecord = await addNewCurrencyHistoryCoin(coinId, vs_currency)
                .catch(err => {
                    throw new Error(err);
                });

            await getCoinHistoryDataBasedOnDays(newRecord.id, days.toString())
                .then((resp)=>{
                    return res.status(200).json(resp);
                });
        }
    } catch (err: any) {
        next(new HttpException(500, err));
    }
}

