export const coinsCode: { [key: string]: string } = {
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

export async function getCoinsCodeStringByValue (){
    let coinsArr: string[] = []
     Object.values(coinsCode).forEach((item)=> {
        coinsArr.push(item);
    });

    return coinsArr;
}
