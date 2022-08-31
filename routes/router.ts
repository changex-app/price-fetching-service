import { Router } from 'express'
import { getCoinHystoryData } from "../services/coins.history.service";
import { getCoinsMarketsData } from "../services/coins.market.service";

const router = Router();

router.get("/coins/:id/market_charts?", getCoinHystoryData);

router.get("/coins/markets?", getCoinsMarketsData);

export default router;
