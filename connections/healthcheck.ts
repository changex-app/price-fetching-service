import mongoose from "mongoose";
import express from "express";

export async function getDatabaseConnectionStatus (
    req: express.Request,
    res: express.Response)
{
    const status = dbHealthCheck()
    if (status) {
        res.status(200).send([status]);
    } else {
        throw new Error('Database connection not available.');
    }
}


export const dbHealthCheck = () => {
    return {
        db: mongoose.connection.readyState === mongoose.ConnectionStates.connected
    };
}
