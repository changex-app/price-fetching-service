import express, {NextFunction} from "express";
import CurrencyMarket, {ICurrencyMarket} from "../models/currencyMarket";
import axios from "axios";
import {FiatExchanges, getFiatExchanges} from "../enums/coin-enums";

export async function getCoinsMarketsData(
    req: express.Request,
    res: express.Response,
    next: NextFunction
){
    /*
     Return all object from the database that are containing in the string of coins/
    */
    if (!res.req.query.ids || !res.req.query.vs_currency) {
        console.error('Missing one of params: `coin ids, `vs_currency`');
        return res.status(400).json({ status: 'Missing one of params: `coin ids, `vs_currency`'});
    }

    let idsFromQueary = res.req.query.ids,
        vs_currency = res.req.query.vs_currency.toString();

    if(idsFromQueary) {
        let idsStr = idsFromQueary.toString(),
            idsArrayFromQueary = idsStr.split(','),
            coinsfromDB = await getMarketCoinGeckosIds() || [],
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
                data.forEach((item: any) => {
                    addNewCurrencyMarketCoin(item);
                })
            }
        }

        await new Promise(f => setTimeout(f, 500));

        const records = await CurrencyMarket.find({exchange_rate: vs_currency}).where('id').in(idsArrayFromQueary).exec();

        res.status(200).json(records);
    }

    next();
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

        return tempArray;
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
            console.log('New Coin addded to CurrencyMarket collection', marketCoin.id);
        })
        .catch((err: any) => {
            console.log('Tried to add new Coin to CurrencyMarket collection', err);
        });
}

export async function requestMarketsCoingeckoData(coins: any): Promise<any> {
    let response: any[] = [],
        fiatExchangeRates = await getFiatExchanges();

    fiatExchangeRates.forEach((exchange_rate)=> {
        let url = `${process.env.COINGECKO_API_URL}coins/markets?ids=${coins.join('%2C')}&vs_currency=${exchange_rate}`;
        try {
            axios.get(url)
                .then((res)=> {
                    if(res.data){
                        res.data.forEach((item: any)=> {
                            item.exchange_rate = exchange_rate;
                            response.push(item);
                        })
                    }
                })
                .catch(function (error){
                    console.log(`${new Date().getTime()}: ${url}error:`, error.response)
                })
        } catch (err) {
            console.log(`Try axios GET ${url} error:`, err)
        }
    })

    await new Promise(f => setTimeout(f, 1000));
    return response;
}

export async function updateCurrencyMarketData(){
    let coins = await getMarketCoinGeckosIds();

    if(coins && coins.length > 0) {
        let data = await requestMarketsCoingeckoData(coins);

        if(data && data.length > 0) {
            data.forEach((item: any)=> {
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

                CurrencyMarket.findOneAndUpdate({id: record.id, exchange_rate: record.exchange_rate}, record, {
                    new: true,
                    upsert: true
                }).catch((err: any) => {
                    console.warn('CurrencyMarket findOneAndUpdate: ', err)
                });
            })
        }
    }
}
