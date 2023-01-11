import { Router } from 'express'
import { getDatabaseConnectionStatus } from "../connections/healthcheck";
import { getCoinHystoryData } from "../controller/coins-history";
import {getAllCoins, getCoinsMarketsData} from "../controller/coins-market";

const router = Router();

router.get("/coins/:id/market_charts?", getCoinHystoryData);

router.get("/coins/markets?", getCoinsMarketsData);

router.get("/status/db", getDatabaseConnectionStatus);

router.get("/coins/all", getAllCoins);

export default router;
