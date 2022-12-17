import axios from 'axios';
import CurrencyHistory, { ICurrencyHistory } from "../models/currencyHistory";
import { CoingeckoService } from "./coingecko.service";
import logger from "../utils/logger";
import { COINGECKO_API_URL } from "../config/config";
import HttpException from "../classes/HttpException";
const coingeckoService = new CoingeckoService();

export async function updateChartHistory(days:number){
    const coins = await getCoingeckoCoinsIdsFromDB();

    if(coins) {
        try {
            for (let coin of coins) {
                let url = `${COINGECKO_API_URL}coins/${coin}/market_chart?days=${days}&vs_currency=usd`,
                    prices: any = [];

                url.replace('%27,', '');

                await coingeckoService.getCoingeckoData(url).then((response)=> {
                    if(response && response.prices.length > 0){
                        prices = response.prices;
                    }
                });

                if(prices && prices.length > 0) {
                    switch (days) {
                        case 1:
                            await updateCoinHistoryData(coin, prices, 'dayHistoryData');
                            break;
                        case 7:
                            await updateCoinHistoryData(coin, prices, 'weekHistoryData');
                            break;
                        case 30:
                            await updateCoinHistoryData(coin, prices, 'monthHistoryData');
                            break;
                        case 365:
                            await updateCoinHistoryData(coin, prices, 'yearHistoryData');
                            break;
                    }
                }
            }
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export async function updateCoinHistoryData(coinId: string, prices: any, keyForUpdate: string) {
    let update = {};
    switch (keyForUpdate) {
        case 'dayHistoryData':
            update = {dayHistoryData: prices};
            break;
        case 'weekHistoryData':
            update = {weekHistoryData: prices};
            break;
        case 'monthHistoryData':
            update = {monthHistoryData: prices};
            break;
        case 'yearHistoryData':
            update = {yearHistoryData: prices};
            break;
    }

    return await CurrencyHistory.findOneAndUpdate({id: coinId}, update, {
        new: true,
        upsert: true
    }).catch((err: any) => {
        throw new Error(err);
    });
}

export async function getCoingeckoCoinsIdsFromDB() {
    let tempArray: Array<string> = [];

    try {
        tempArray = await CurrencyHistory.distinct("id");
    } catch (err) {
        logger.error(`getCoingeckoCoinsIdsFromDB'${err}`);
    }

   return tempArray;
}

export async function addNewCurrencyHistoryCoin(coin: string, currency: any): Promise<ICurrencyHistory>{
    try {
        let url1 = `${COINGECKO_API_URL}coins/${coin}/market_chart?days=1&vs_currency=${currency}`,
            url7 = `${COINGECKO_API_URL}coins/${coin}/market_chart?days=7&vs_currency=${currency}`,
            url30 = `${COINGECKO_API_URL}coins/${coin}/market_chart?days=30&vs_currency=${currency}`,
            url365 = `${COINGECKO_API_URL}coins/${coin}/market_chart?days=365&vs_currency=${currency}`,
            dayHistoryData: Promise<any> = await  makeCoingeckoRequest(url1),
            weekHistoryData: Promise<any> =  await makeCoingeckoRequest(url7),
            montHistoryData: Promise<any> =  await makeCoingeckoRequest(url30),
            yearHistoryData: Promise<any> =  await makeCoingeckoRequest(url365);

        let currencyHistory = new CurrencyHistory ({
            id: coin,
            coingeckoCode: coin,
            dayHistoryData: dayHistoryData,
            weekHistoryData: weekHistoryData,
            monthHistoryData: montHistoryData,
            yearHistoryData: yearHistoryData
        })

        await currencyHistory.save();

        return currencyHistory;
    } catch (err: any) {
        throw Error(err);
    }
}

export async function makeCoingeckoRequest(url: string): Promise<any> {
    let pricesArray: any[] = [];
    try {
        await axios.get(url)
            .then((response)=> {
                let data = response.data;
                if(data) {
                    pricesArray = data.prices
                }})
    } catch (err: any) {
        new HttpException(400, err)
    }
    return pricesArray;
}

export async function initailUpdateOfTheDatabase(coins: Array<string>): Promise<void> {
    for (const coin of coins) {
        try {
            await new Promise(f => setTimeout(f, 2000));
            await addNewCurrencyHistoryCoin(coin, 'usd')
        } catch (err: any) {
            logger.error('Fail database initial update');
            throw new Error(err)
        }
    }
}

export async function getCoinHistoryDataBasedOnDays(coinId: string, days: string): Promise<any>{
    let data;
    await CurrencyHistory.find({id: coinId}).then((response: any)=> {
        switch (days){
            case '1':
                data = { prices: response[0].dayHistoryData };
                break;
            case '7':
                data = { prices: response[0].weekHistoryData };
                break;
            case '30':
                data = { prices: response[0].monthHistoryData };
                break;
            case '365':
                data = { prices: response[0].yearHistoryData };
                break;
        }
    })

    return data;
}
