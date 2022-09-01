import express, {NextFunction} from "express";
import CurrencyMarket, {ICurrencyMarket} from "../models/currencyMarket";
import axios from "axios";
import { FiatExchanges } from "../enums/coin-enums";

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
            let url = `${process.env.COINGECKO_API_URL}coins/markets?ids=${missingCoinArr.join('%2C')}&vs_currency=${vs_currency}`,
                data = await requestMarketsCoingeckoData(url);

            if(data) {
                data.forEach((item: any) => {
                    addNewCurrencyMarketCoin(item);
                })
            }
        }

        await new Promise(f => setTimeout(f, 500));

        const records = await CurrencyMarket.find().where('id').in(idsArrayFromQueary).exec();

        if(vs_currency !== FiatExchanges.USD){
            let exchange_rate = await getExchangeRate(vs_currency.toUpperCase());
            records.forEach((item: ICurrencyMarket)=> {
                item.current_price = (parseInt(item.current_price) * exchange_rate).toString();
                item.market_cap = (parseInt(item.market_cap) * exchange_rate * exchange_rate).toString();
                item.price_change_percentage_24h = (parseInt(item.price_change_percentage_24h) * exchange_rate).toString();
                item.market_cap_change_24h = (parseInt(item.market_cap_change_24h)  * exchange_rate).toString();
                item.market_cap_change_percentage_24h = (parseInt(item.market_cap_change_percentage_24h) * exchange_rate).toString();
                item.total_volume = (parseInt(item.total_volume) * exchange_rate).toString();
                item.circulating_supply = (parseInt(item.circulating_supply) * exchange_rate).toString();
            })
        }
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
        current_price: item.current_price.toString(),
        market_cap: item.market_cap.toString(),
        price_change_percentage_24h: item.price_change_percentage_24h.toString(),
        market_cap_change_24h: item.market_cap_change_24h.toString(),
        market_cap_change_percentage_24h: item.market_cap_change_percentage_24h.toString(),
        total_volume: item.total_volume.toString(),
        circulating_supply: item.circulating_supply.toString(),
    });

    await marketCoin.save()
        .then(()=> {
            console.log('New Coin addded to CurrencyMarket collection', marketCoin.id);
        })
        .catch((err: any) => {
            console.log('Tried to add new Coin to CurrencyMarket collection', err);
        });
}

export async function requestMarketsCoingeckoData(url: string): Promise<any> {
    let response: any[] = [];
    try {
        await axios.get(url)
            .then((res)=> {
                if(res.data){
                    response = res.data;
                }
            })
            .catch(function (error){
                console.log(` ${url} error:`, error.response)
            })
    } catch (err) {
        console.log(`Try axios GET ${url} error:`, err)
    }

    return response;
}

export async function updateCurrencyMarketData(){
    let coins = await getMarketCoinGeckosIds();

    if(coins && coins.length > 0) {
        let url = `${process.env.COINGECKO_API_URL}coins/markets?ids=${coins.join('%2C')}&vs_currency=usd`,
            data = await requestMarketsCoingeckoData(url);

        data.forEach((item: any)=> {
            let record = {
                id: item.id,
                name: item.name,
                symbol: item.symbol,
                current_price: item.current_price.toString(),
                market_cap: item.market_cap.toString(),
                price_change_percentage_24h: item.price_change_percentage_24h.toString(),
                market_cap_change_24h: item.market_cap_change_24h.toString(),
                market_cap_change_percentage_24h: item.market_cap_change_percentage_24h.toString(),
                total_volume: item.total_volume.toString(),
                circulating_supply: item.circulating_supply.toString()
            }

            CurrencyMarket.findOneAndUpdate({id: record.id}, record, {
                new: true,
                upsert: true
            }).catch((err: any) => {
                console.warn('CurrencyMarket findOneAndUpdate: ', err)
            });
        })
    }
}

export async function getExchangeRate(currency: any): Promise<number> {
    let url = `${process.env.EXCHANGE_RATE_API}&?base=usd&symbols=${currency}}`,
    returnValue: number = 1;

    await axios.get(url)
        .then((response)=> {
            if(response && response.data) {
                returnValue = response.data.rates[currency]
            }
        })
        .catch((err)=> {
            console.log('Get exchange rates error: ', err.message)
        })

    return returnValue
}
