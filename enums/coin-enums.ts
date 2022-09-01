export const FiatExchanges: { [key: string]: string } = {
    USD: 'usd',
    EUR: 'eur'
};

export async function getFiatExchanges(){
    let fiatArr: string[] = []
    Object.values(FiatExchanges).forEach((item)=> {
        fiatArr.push(item);
    });

    return fiatArr;
}

export const CoinsCode: { [key: string]: string } = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    HYDRA: 'hydra',
    CHANGE: 'changex',
    USDT: 'tether',
    TRON: 'tron',
    DAI: 'dai',
    USD_COIN: 'usd-coin',
    UNISWAP: 'uniswap',
    LOCKTRIP: 'lockchain'
};

export async function getCoinsCodeStringByValue(){
    let coinsArr: string[] = []
     Object.values(CoinsCode).forEach((item)=> {
        coinsArr.push(item);
    });

    return coinsArr;
}

