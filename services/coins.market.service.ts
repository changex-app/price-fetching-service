import express, {NextFunction} from "express";
import CurrencyMarket from "../models/currencyMarket";
import axios from "axios";
import {getFiatExchanges} from "../enums/coin-enums";

export async function getCoinsMarketsData(
    req: express.Request,
    res: express.Response,
    next: NextFunction
){
    if (!res.req.query.ids || !res.req.query.vs_currency) {
        next(new Error('Missing one of params: `coin ids, `vs_currency`'));
        return;
    }

    let idsFromQueary = res.req.query.ids,
        vs_currency = res.req.query.vs_currency.toString();

    if(idsFromQueary) {
        let idsStr = idsFromQueary.toString(),
            idsArrayFromQueary = idsStr.split(','),
            coinsfromDB = await getMarketCoinGeckosIds(),
            missingCoinArr: string[] = [];

        idsArrayFromQueary!.forEach((item)=> {
            if(coinsfromDB && !coinsfromDB.includes(item)){
                missingCoinArr.push(item)
            }
        })

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
    }
}

export async function getMarketCoinGeckosIds() {
    let coins: any,
        tempArray: Array<string> = [];

    try {
        coins = await CurrencyMarket.find({})
        if (coins == null) {
            console.log('Coins are empty');
            return;
        }

        coins.forEach(function (coin:any){
            tempArray.push(coin.id)
        })

        return tempArray.filter((v: any, i: any, a: any) => a.indexOf(v) === i);

    } catch (err) {
        console.log('getMarketCoinGeckosIds', err);
    }
}

export async function addNewCurrencyMarketCoin(item: any) {
    const marketCoin = new CurrencyMarket({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        current_price:  item.current_price,
        market_cap: item.market_cap,
        price_change_percentage_24h: item.price_change_percentage_24h,
        market_cap_change_24h: item.market_cap_change_24h,
        market_cap_change_percentage_24h: item.market_cap_change_percentage_24h,
        total_volume: item.total_volume,
        circulating_supply: item.circulating_supply,
        exchange_rate: item.exchange_rate
    });

    await marketCoin.save()
        .then(()=> {
            console.log('New Coin addded to CurrencyMarket collection', marketCoin.id, marketCoin.exchange_rate );
        })
        .catch((err: any) => {
            console.log('Tried to add new Coin to CurrencyMarket collection', err);
        });
}

export async function requestMarketsCoingeckoData(coins: any): Promise<any> {
    let response: any[] = [],
        fiatExchangeRates = await getFiatExchanges();

    for (const exchange_rate of fiatExchangeRates) {
        let url = `${process.env.COINGECKO_API_URL}coins/markets?ids=${coins.join('%2C')}&vs_currency=${exchange_rate}`;

        //Replace is done because sometimes " ` " is replaced with encoding %27,
        let encodedURL = url.replace('%27,', '');

        try {
           await axios.get(url)
                .then((res)=> {
                    if(res.data){
                        res.data.forEach((item: any)=> {
                            item.exchange_rate = exchange_rate;
                            response.push(item);
                        })
                    }
                })
        } catch (err) {
            throw new Error(`${new Date().getTime()} : ${url}} error: ${err}`);
        }
    }

    return response;
}

export async function updateCurrencyMarketData(){
    let coins = await getMarketCoinGeckosIds();

    if(coins && coins.length > 0) {
        let data = await requestMarketsCoingeckoData(coins);

        if(data && data.length > 0) {
            for (const item of data) {
                let record = {
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    current_price:  item.current_price,
                    market_cap: item.market_cap,
                    price_change_percentage_24h: item.price_change_percentage_24h,
                    market_cap_change_24h: item.market_cap_change_24h,
                    market_cap_change_percentage_24h: item.market_cap_change_percentage_24h,
                    total_volume: item.total_volume,
                    circulating_supply: item.circulating_supply,
                    exchange_rate: item.exchange_rate
                }

                await CurrencyMarket.findOneAndUpdate({id: record.id, exchange_rate: record.exchange_rate}, record, {
                    new: true,
                    upsert: true
                }).catch((err: any) => {
                    console.warn('CurrencyMarket findOneAndUpdate: ', err)
                });
            }
        }
    }
}
