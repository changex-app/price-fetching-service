const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { Document } from "mongoose";

export interface ICurrencyMarket extends Document  {
    id: string,
    name: string
    symbol: string,
    current_price: string,
    market_cap: string,
    price_change_percentage_24h: string,
    market_cap_change_24h: string,
    market_cap_change_percentage_24h: string,
    total_volume: string,
    circulating_supply: string,
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
    symbol: {
        type: String,
        required: true
    },
    current_price: {
        type: String,
        required: true,
        float: true
    },
    market_cap: {
        type: String,
        float: true
    },
    price_change_percentage_24h: {
        type: String,
        float: true
    },
    market_cap_change_24h: {
        type: String,
        float: true
    },
    market_cap_change_percentage_24h: {
        type: String,
        float: true
    },
    total_volume: {
        type: String,
        float: true
    },
    circulating_supply: {
        type: String,
        float: true
    }
}, { collection: "CurrencyMarket" }
);

export default mongoose.model('CurrencyMarket', currencyMarketSchema);
