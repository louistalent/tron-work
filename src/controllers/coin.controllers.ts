import express, { Request, Response } from 'express';
import {
    getDecimal,
    encodeParams,
    decodeParams,
    getAddressFromPrivatekey,
    getEnergyPrice,
    getAccountResource,
    getBandwidthPrices,
    getChainParameters,
    getBalance_,
    getConsumedBandwidth,
    estimateTransferFee_
} from '../utils/tron.utils';
const TronWeb = require('tronweb')

const HttpProvider = TronWeb.providers.HttpProvider;

// const fullNode = new HttpProvider(process.env.TRON_NILE_TEST_RPC);
// const solidityNode = new HttpProvider(process.env.TRON_NILE_TEST_RPC);
// const eventServer = new HttpProvider(process.env.TRON_NILE_TEST_EVENT_SERVER);

const fullNode = new HttpProvider(process.env.TRON_MAINNET_RPC);
const solidityNode = new HttpProvider(process.env.TRON_MAINNET_RPC);
const eventServer = new HttpProvider(process.env.TRON_MAINNET_EVENT_SERVER);

// const TRC20_CONTRACT = process.env.TRC20_CONTRACT;
const TRC20_CONTRACT = process.env.TRON_MAINNET_TRC20_CONTRACT;
// const memo = "gfpay";

export const getBalance = async (req: Request, res: Response) => {
    try {
        const { chain, token, tokenContract, address } = req.body;
        const balance = await getBalance_(chain, token, tokenContract, address);
        res.status(200).json({ balance })
    } catch (error: any) {
        console.log('getBalance', error)
    }

}
export const sendNativeToken = async (req: Request, res: Response) => {
    try {
        const { chain, privateKey, toAddress, amount } = req.body;  //test
        if (chain == "tron") {
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });
            const fromAddress = getAddressFromPrivatekey(privateKey);
            console.log('fromAddress', fromAddress)
            if (fromAddress == false){
                res.status(200).json({
                    code: "0001",
                    message: "you provide invalid private key"
                });
                return;
            }
            const unSignedTxn = await tronWeb.transactionBuilder.sendTrx(toAddress, (amount * (10 ** 6)).toString());
            const unSignedTxnWithNote = await tronWeb.transactionBuilder.addUpdateData(unSignedTxn, '');
            const signedTxn = await tronWeb.trx.sign(unSignedTxnWithNote, privateKey);
            const isActivated = await getAccountResource(toAddress);
            let estimatedFee;
            if (isActivated.bandwidth == 0 && isActivated.energy == 0){
                estimatedFee = 1 + 0.1 // 1 trx + 100bandwidth for activate receiving account
            }else{
                estimatedFee = await estimateTransferFee_(chain, 'coin', privateKey, 'tokenContract', toAddress, amount, signedTxn);
            }
            const balance = await getBalance_(chain, 'coin', 'tokenContract', fromAddress);
            console.log('estimatedFeeTRX, balanceTRX', estimatedFee, balance);
            if (amount > balance ){
                res.status(200).json({
                    code: "0001",
                    message: "you don't have enough TRX"
                });
                return;
            }
            if (estimatedFee) {
                if (estimatedFee <= balance) {
                    const result = await tronWeb.trx.sendRawTransaction(signedTxn);
                    console.log('result', result.txid)
                    if (result && result.txid){
                        res.status(200).json({
                            code: "0000",
                            message: "success",
                            txid:result.txid
                        });
                    }
                } else {
                    res.status(200).json({
                        code: "0001",
                        message: "you don't have enough fee"
                    });
                }
            } else {
                res.status(400).json({
                    code: "1003",
                    message: estimatedFee
                });
            }
        }
    } catch (error:any) {
        console.log("sendNativeToken", error)
        res.status(400).json({
            code: "1003",
            message: error
        }); 
    }
}
export const sendToken = async (req: Request, res: Response) => {
    try {
        const { chain, privateKey, tokenContract, toAddress, amount } = req.body;
        if (chain == "tron") {
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });
            const fromAddress = getAddressFromPrivatekey(privateKey);
            const balanceOfToken = await getBalance_(chain, 'token', tokenContract, fromAddress);
            if (amount > balanceOfToken) {
                res.status(200).json({
                    code: "0001",
                    message: "you don't have enough crypto"
                });
                return;
            }

            const tokenDecimal = await getDecimal('tron', tokenContract);
            const options = {
                feeLimit: 10000000,
                callValue: 0
            };
            const parameter1 = [
                { type: 'address', value: toAddress },
                { type: 'uint256', value: (amount * (10 ** tokenDecimal)).toString() },
            ];

            const tx = await tronWeb.transactionBuilder.triggerSmartContract(
                tokenContract, 
                'transfer(address,uint256)', 
                options,
                parameter1,
                fromAddress
            );

            const signedTx = await tronWeb.trx.sign(tx.transaction);
            const estimatedFee: any = await estimateTransferFee_(chain, 'token', privateKey, tokenContract, toAddress, amount, signedTx);
            const TRXbalance = await getBalance_(chain, 'coin', tokenContract, fromAddress);
            console.log('estimatedFee, balance', estimatedFee, TRXbalance);
            if (estimatedFee) {
                if (estimatedFee <= TRXbalance) {
                    // const { abi } = await tronWeb.trx.getContract(tokenContract);
                    // const contract = tronWeb.contract(abi.entrys, tokenContract);
                    // const result = await contract.methods.transfer(toAddress, (amount * (10 ** tokenDecimal)).toString()).send();
                    const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
                    res.status(200).json({
                        code: "0000",
                        message: "success"
                    });
                } else {
                    res.status(200).json({
                        code: "0001",
                        message: "you don't have enough TRX to send this token"
                    });
                }
            } else {
                res.status(400).json({
                    code: "1003",
                    message: estimatedFee
                });
            }
        }
    } catch (error: any) {
        console.log("sendTRC20", error)
        res.status(400).json({
            code: "1003",
            message: error
        });
    }
}
export const estimateTransferFee = async (req: Request, res: Response) => {
    try {
        const { chain, token, privateKey, tokenContract, toAddress, amount } = req.body;
        const estimatedFee = await estimateTransferFee_(chain, token, privateKey, tokenContract, toAddress, amount);
        res.status(200).json({ estimatedFee })
    } catch (error: any) {
        console.log(error)
    }
}

export const createWallet = async (req: Request, res: Response) => {
    const { chain } = req.body;  //test
    if (chain == "tron") {
        const privateKey = process.env.TRON_PRIVATE_KEY;//admin private key
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
        tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });
        const data = await tronWeb.createAccount()
        res.status(200).json(data);
    }
}
export const test = async (req: Request, res: Response) => {
   const result =  await getConsumedBandwidth('')
    res.status(200).json({ result })
}
