import express, {NextFunction} from "express";
import axios from 'axios';
import CurrencyHistory, { ICurrencyHistory } from "../models/currencyHistory";
import { CoingeckoService } from "./coingecko.service";
const coingeckoService = new CoingeckoService();

export async function updateChartHistory(days:number){
    const coins = await getCoingeckoCoinsIdsFromDB();
    if(coins) {
        for (let coin of coins) {
            let url = `${process.env.COINGECKO_API_URL}coins/${coin}/market_chart?days=${days}&vs_currency=usd`,
                prices: any = [];

            await coingeckoService.getCoingeckoData(url).then((response)=> {
                prices = response.prices;
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
    }
}

async function updateCoinHistoryData(coinId: string, prices: any, keyForUpdate: string) {
    console.warn('updateCoinHistoryData');
    return await CurrencyHistory.findOneAndUpdate({id: coinId}, {[keyForUpdate]: prices}, {
        new: true,
        upsert: true
    }).catch((err: any) => {
        console.warn('CurrencyHistory findOneAndUpdate: ', err)
    });
}

export async function getCoingeckoCoinsIdsFromDB() {
    let tempArray: Array<string> = [];
    try {
         await CurrencyHistory.find({}).then((resp: [ICurrencyHistory])=> {
            resp.forEach(function (coin:any){
                tempArray.push(coin.id);
            })
        })
    } catch (err) {
        console.log('getCoingeckoCoinsIdsFromDB', err);
    }

   return tempArray;
}

export async function getCoinHystoryData(
    req: express.Request,
    res: express.Response,
    next: NextFunction
){
    if (!res.req.query.days || !res.req.query.vs_currency || !res.req.url) {
        console.error('Missing one of params: `days, `vs_currency`, `url`');
        return res.status(400).json({ status: 'Missing one of params: `days, `vs_currency`, `url`'});
    }

    let coinId =  res.req.url.split("/")[2],
        days = res.req.query.days,
        vs_currency = res.req.query.vs_currency,
        coinsArrayInDB = await getCoingeckoCoinsIdsFromDB(),
        coinExists = false;

    if(coinsArrayInDB?.includes(coinId)) {
        coinExists = true
    }

    if(coinExists){
        try{
             await getCoinHistoryDataBasedOnDays(coinId, days.toString())
                .then((resp)=> {
                    return res.status(200).json(resp);
                });

        } catch (err){
            res.status(500).send(err);
        }
    } else {
        let newRecord = await addNewCurrencyHistoryCoin(coinId, vs_currency);
        await getCoinHistoryDataBasedOnDays(newRecord.id, days.toString())
            .then((resp)=>{
                return res.status(200).json(resp);
            });
    }

    next();
}

async function addNewCurrencyHistoryCoin(coin: string, currency: any): Promise<ICurrencyHistory>{
    let url1 = `${process.env.COINGECKO_API_URL}coins/${coin}/market_chart?days=1&vs_currency=${currency}`,
        url7 = `${process.env.COINGECKO_API_URL}coins/${coin}/market_chart?days=7&vs_currency=${currency}`,
        url30 = `${process.env.COINGECKO_API_URL}coins/${coin}/market_chart?days=30&vs_currency=${currency}`,
        url365 = `${process.env.COINGECKO_API_URL}coins/${coin}/market_chart?days=365&vs_currency=${currency}`,
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
}

async function makeCoingeckoRequest(url: string): Promise<any> {
    let pricesArray: any[] = [];
    try {
        await axios.get(url)
            .then((response)=> {
                let data = response.data;
                if(data) {
                    pricesArray = data.prices
                }})
            .catch((error)=> {
                console.log(` ${url} error:`, error.response)
            })
    } catch (err) {
        console.log(`Try axios GET ${url} error:`, err)
    }
    return pricesArray;
}

export async function initailUpdateOfTheDatabase(coins: Array<string>): Promise<boolean> {
    coins.forEach((coin)=> {
        addNewCurrencyHistoryCoin(coin, 'usd')
    })

    return await new Promise(f => setTimeout(f, 2000));
}

async function getCoinHistoryDataBasedOnDays(coinId: string, days: string): Promise<any>{
    let data;
    await CurrencyHistory.find({id: coinId}).then((response: any)=> {
        switch (days){
            case '1':
                data = { prices: response[0].dayHistoryData };
                break;
            case '7':
                data = { prices: response[0].dayHistoryData };
                break;
            case '30':
                data = { prices: response[0].dayHistoryData };
                break;
            case '365':
                data = { prices: response[0].dayHistoryData };
                break;
        }
    })

    return data;
}
