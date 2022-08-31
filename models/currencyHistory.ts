const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { Document } from "mongoose";

export interface IHistoryData extends Document  {
    timestamp: string,
    price: number
}

export interface ICurrencyHistory extends Document {
    id: string,
    coingeckoCode: string,
    dayHistoryData: IHistoryData[],
    weekHistoryData: IHistoryData[],
    monthHistoryData: IHistoryData[],
    yearHistoryData: IHistoryData[]
}

export const currencyHistorySchema = new Schema ({
        id: {
            type: String,
            required: true,
            unique: true
        },
        coingeckoCode: {
            type: String,
            required: true,
            unique: true
        },
        dayHistoryData: [
            {
                timestamp: Number,
                price: Number
            }
        ],
        weekHistoryData: [
            {
                timestamp: Number,
                price: Number
            }
        ],
        monthHistoryData: [
            {
                timestamp: Number,
                price: Number
            }
        ],
        yearHistoryData: [
            {
                timestamp: Number,
                price: Number
            }
        ]
    }, {collection: 'CurrencyHistory'}
);

export default mongoose.model('CurrencyHistory', currencyHistorySchema);
