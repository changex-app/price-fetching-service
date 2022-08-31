export const coinsCode: { [key: string]: string } = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    HYDRA: 'hydra',
    CHANGE: 'changex',
    TETHER: 'tether',
    TRON: 'tron',
    DAI: 'dai',
    USD_COIN: 'usd-coin'
};

export async function getCoinsCodeStringByValue (){
    let coinsArr: string[] = []
     Object.values(coinsCode).forEach((item)=> {
        coinsArr.push(item);
    });

    return coinsArr;
}
