import { CronJob } from 'cron'
import { updateChartHistory } from '../services/coins.history.service';
import { updateCurrencyMarketData } from "../services/coins.market.service";

export const updateCoinsData = () => {
    //At every 30 seconds.
    new CronJob('*/29 * * * * *', async () =>{
       await updateCurrencyMarketData()
           .catch(err => {
               throw new Error(`When updating currency market on 30 esconds :, ${err}, 'message:' + ${err.message}`)
           })
    }).start();

    //At every 40th minute.
    new CronJob('*/40 * * * *', async () =>{
        await updateChartHistory(1)
            .catch(err => {
                throw new Error(`Try axios GET 1 day data error: ${err}`)
            });

    }).start();

    //At minute 10 past every 2nd hour.
    new CronJob('10 */2 * * * ', async () => {
        await updateChartHistory(7)
            .catch(err => {
                throw new Error(`Try axios GET 7 day data error: ${err.message}`)
            });
    }).start();

    //At minute 30 past every 12th hour
    new CronJob('30 */12 * * *', async () => {
        await updateChartHistory(30)
            .catch(err => {
                throw new Error(`Try axios GET 30 day data error: ${err.message}`)
            });
    }).start();

    //At minute 15 past every 24th hour.
    new CronJob('15 */24 * * *', async () => {
        await updateChartHistory(365)
            .catch(err => {
                throw new Error(`Try axios GET 365 day data error: ${err.message}`)
            });
    }).start();
}
