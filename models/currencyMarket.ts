const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { Document } from "mongoose";

export interface ICurrencyMarket extends Document  {
    id: string,
    name: string
    code: string,
    coingeckoCode: string,
    price: number,
    marketCap: number,
    pricePercentage24h: number,
    marketCapPercentage24h: number,
    totalVolume: number,
    circulatingSupply: number,
}

export const currencyMarketSchema = new Schema ({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    coingeckoCode: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        float: true
    },
    marketCap: {
        type: Number,
        float: true
    },
    pricePercentage24h: {
        type: Number,
        float: true
    },
    marketCapPercentage24h: {
        type: Number,
        float: true
    },
    totalVolume: {
        type: Number,
        float: true
    },
    circulatingSupply: {
        type: Number,
        float: true
    }
}, { collection: "CurrencyMarket" }
);

export default mongoose.model('CurrencyMarket', currencyMarketSchema);
