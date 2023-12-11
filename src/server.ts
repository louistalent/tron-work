import dotenv from 'dotenv';
import path from "path"

const cron = require('node-cron');

if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
}

import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';

const app: Application = express()
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    // origin: "*",
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

import coinRouter from "./routes/coin.routes"
app.use("/api", coinRouter)

const port: number = Number(process.env.PORT)
app.listen(port, async () => {
    console.log(`App is listening on port ${port}`);
});