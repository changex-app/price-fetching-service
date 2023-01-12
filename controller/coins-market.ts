import express, {NextFunction} from "express";
import CurrencyMarket from "../models/currencyMarket";
import {
    addNewCurrencyMarketCoin,
    getMarketCoinGeckosIds,
    requestMarketsCoingeckoData
} from "../services/coins.market.service";
import logger from "../utils/logger";
import HttpException from "../classes/HttpException";

export async function getCoinsMarketsData(
    req: express.Request,
    res: express.Response,
    next: NextFunction
){
    const query = req.query;

    if (!query['ids'] || !query['vs_currency']) {
        logger.error('Missing one of params: `coin ids, `vs_currency`');
        next(new HttpException(400, 'Missing one of params: `coin ids, `vs_currency'));
    }

    let idsFromQueary = query['ids'],
        // @ts-ignore
        vs_currency = query['vs_currency'] ?  query['vs_currency'].toString() : 'usd';

    if(idsFromQueary) {
        try {
            let idsStr = idsFromQueary.toString(),
                idsArrayFromQueary = idsStr.split(','),
                coinsfromDB = await getMarketCoinGeckosIds(),
                missingCoinArr: string[] = [];

            for (const item of idsArrayFromQueary) {
                if(coinsfromDB && !coinsfromDB.includes(item)){
                    missingCoinArr.push(item)
                }
            }

            if(missingCoinArr.length > 0) {
                //Add missing requested coin to database
                let data = await requestMarketsCoingeckoData(missingCoinArr);

                if(data) {
                    for (const item of data){
                        await addNewCurrencyMarketCoin(item);
                    }
                }
            }

            const records = await CurrencyMarket.find({exchange_rate: vs_currency}).where('id').in(idsArrayFromQueary).exec();

            res.status(200).json(records);
        } catch (err: any) {
            next(new HttpException(500, err));
        }
    }
}


export async function getAllCoins(  req: express.Request,
                                     res: express.Response,
                                     next: NextFunction
){
    const coinsfromDB = await getMarketCoinGeckosIds()
        .catch((err)=> {
            next(new HttpException(500, err));
        })

    res.status(200).json(coinsfromDB);
}
