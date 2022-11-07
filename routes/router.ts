import { Router } from 'express'
import { getCoinHystoryData } from "../services/coins.history.service";
import { getCoinsMarketsData } from "../services/coins.market.service";
import { getDatabaseConnectionStatus } from "../connections/healthcheck";

const router = Router();

router.get("/coins/:id/market_charts?", getCoinHystoryData);

router.get("/coins/markets?", getCoinsMarketsData);

router.get("/status/db", getDatabaseConnectionStatus);

export default router;
