const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { Document } from "mongoose";

export interface ICurrencyMarket extends Document  {
    id: string,
    name: string
    symbol: string,
    current_price: number,
    market_cap: number,
    price_change_percentage_24h: number,
    market_cap_change_24h: number,
    market_cap_change_percentage_24h: number,
    total_volume: number,
    circulating_supply: number,
    exchange_rate: string
}

export const currencyMarketSchema = new Schema ({
    id: {
        type: String,
        required: true,
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
        type: Number,
        required: true,
        float: true
    },
    market_cap: {
        type: Number,
        float: true
    },
    price_change_percentage_24h: {
        type: Number,
        float: true
    },
    market_cap_change_24h: {
        type: Number,
        float: true
    },
    market_cap_change_percentage_24h: {
        type: Number,
        float: true
    },
    total_volume: {
        type: Number,
        float: true
    },
    circulating_supply: {
        type: Number,
        float: true
    },
    exchange_rate: {
        type: String,
        required: true

    }
}, { collection: "CurrencyMarket" }
);

export default mongoose.model('CurrencyMarket', currencyMarketSchema);
