import { Router } from 'express'
import { getDatabaseConnectionStatus } from "../connections/healthcheck";
import { getCoinHystoryData } from "../controller/coins-history";
import { getCoinsMarketsData } from "../controller/coins-market";

const router = Router();

router.get("/coins/:id/market_charts?", getCoinHystoryData);

router.get("/coins/markets?", getCoinsMarketsData);

router.get("/status/db", getDatabaseConnectionStatus);

export default router;
