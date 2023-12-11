
import crypto from 'crypto';
import * as dataAccess from "../utils/dataAccess.utils"

//It is recommended to use ethers4.0.47 version
import axios from "axios";
const TronWeb = require('tronweb');
const ethers = require('ethers');
const AbiCoder: any = ethers?.utils?.AbiCoder;
const TRON_NETWORK = process.env.TRON_MAINNET_RPC;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";
const HttpProvider = TronWeb.providers.HttpProvider;

const fullNode = new HttpProvider(process.env.TRON_MAINNET_RPC);
const solidityNode = new HttpProvider(process.env.TRON_MAINNET_RPC);
const eventServer = new HttpProvider(process.env.TRON_MAINNET_EVENT_SERVER);

export const createTrxId = () => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const timePart = now.toISOString().split('T')[1].replace(/[:.Z]/g, ''); // hhmmssmmm
    const transactionId = datePart + timePart
    return transactionId;
}

export const getDecimal = async (chain: string, contractAddress: string) => {
    try {
        if (chain == "tron") {
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, process.env.TRON_PRIVATE_KEY);
            const { abi } = await tronWeb.trx.getContract(contractAddress);
            const instance = tronWeb.contract(abi.entrys, contractAddress);

            let decimalOfTokenContractBigNumber = await instance.decimals().call();
            let decimalOfTokenContract = await tronWeb.toDecimal(decimalOfTokenContractBigNumber)

            console.log('decimalOfTokenContract', decimalOfTokenContract);
            return decimalOfTokenContract;
        }
    } catch (error: any) {
        console.log("getDecimal ", error)
    }

}

export const encodeParams = async (inputs: any) => {

    let typesValues = inputs
    let parameters = ''

    if (typesValues.length == 0)
        return parameters
    const abiCoder = new AbiCoder();
    let types = [];
    const values = [];

    for (let i = 0; i < typesValues.length; i++) {
        let { type, value }: any = typesValues[i];
        if (type == 'address')
            value = value.replace(ADDRESS_PREFIX_REGEX, '0x');
        else if (type == 'address[]')
            value = value.map((v: any) => ethers.utils.hexlify(v).replace(ADDRESS_PREFIX_REGEX, '0x'));
        types.push(type);
        values.push(value);
    }

    console.log(types, values)
    try {
        parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
    } catch (ex) {
        console.log(ex);
    }
    return parameters

}

export const decodeParams = async (types: any, output: any, ignoreMethodHash: any) => {
    //types:Parameter type list, if the function has multiple return values, the order of the types in the list should conform to the defined order
    //output: Data before decoding
    //ignoreMethodHash：Decode the function return value, fill falseMethodHash with false, if decode the data field in the gettransactionbyid result, fill ignoreMethodHash with true

    if (!output || typeof output === 'boolean') {
        ignoreMethodHash = output;
        output = types;
    }

    if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
        output = '0x' + output.replace(/^0x/, '').substring(8);

    const abiCoder = new AbiCoder();

    if (output.replace(/^0x/, '').length % 64)
        throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
    return abiCoder.decode(types, output).reduce((obj: any, arg: any, index: any) => {
        if (types[index] == 'address')
            arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
        obj.push(arg);
        return obj;
    }, []);
}

// export async function decodeAndEncode() {
//     let inputs = [
//         { type: 'address', value: "412ed5dd8a98aea00ae32517742ea5289761b2710e" },
//         { type: 'uint256', value: 50000000000 }
//     ]
//     const result1 = await encodeParams(inputs)

//     // https://api.trongrid.io/wallet/gettransactionbyid

//     let data = '0xa9059cbb0000000000000000000000004f53238d40e1a3cb8752a2be81f053e266d9ecab000000000000000000000000000000000000000000000000000000024dba7580'
//     const result2 = await decodeParams(['address', 'uint256'], data, true)
// }

export const getAddressFromPrivatekey = (privateKey: any) => {
    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
    const address = tronWeb.address.fromPrivateKey(privateKey);
    return address;

}
export const getEnergyPrice = async () => {
    const options = {
        method: 'GET',
        url: `${TRON_NETWORK}/wallet/getenergyprices`,
        headers: { accept: 'application/json' }
    };
    const result: any = await axios.request(options);
    // console.log(result.data.prices)
    const pricesArray = result.data.prices.split(",");
    const finialChangedPrice = pricesArray[pricesArray.length - 1].split(':')
    return finialChangedPrice[finialChangedPrice.length - 1];
}

// It will be using to get energy and bandwidth from account.
export const getAccountResource = async (address: any) => {
    const options = {
        method: 'POST',
        url: `${TRON_NETWORK}/wallet/getaccountresource`,
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        data: { address: address, visible: true }
    };
    const result = await axios.request(options);
    // const bandwidth = await tronWeb.trx.getBandwidth(address);
    let energyOfCurrent = 0;
    console.log("getAccountResource result.data", result.data);
    if (!result.data){
        // result.data = {}
        // deactivated account
        return {
            bandwidth: 0,
            energy: 0
        };
    }
    let freeNetUsed = result.data.freeNetUsed;
    let energyUsed = result.data.EnergyUsed;
    if (freeNetUsed == undefined){
        freeNetUsed = 0;
    }
    if (energyUsed == undefined){
        energyUsed = 0;
    }
    const bandwidthOfCurrent = result.data.freeNetLimit - freeNetUsed;
    
    if (result.data.EnergyLimit) {
        energyOfCurrent = result.data.EnergyLimit - energyUsed;
    }

    return {
        bandwidth: bandwidthOfCurrent,
        energy: energyOfCurrent
    };
}
export const estimateTransferFee_ = async (chain: string, token: string, privateKey: string, tokenContract: string, toAddress: string, amount: number, signedTx?:any) => {
    try {
        if (chain == "tron") {
            const fromAddress = getAddressFromPrivatekey(privateKey);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let signedTx_;

            if(signedTx == undefined){
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
                signedTx_ = await tronWeb.trx.sign(tx.transaction);
            }else{
                signedTx_ = signedTx;
                console.log('called in send')
            }

            if (token == 'coin') {
                // bandwidth of address
                const transactionHexStr = signedTx_.raw_data_hex.length;
                const transactionHexStr2 = signedTx_.signature[0].length;
                let bandwidth = transactionHexStr / 2 + transactionHexStr2 + 4;
                console.log('consumed bandwidth', bandwidth)
                let assetOfsenderAccount = await getAccountResource(fromAddress);
              
                if (assetOfsenderAccount.bandwidth > bandwidth) {
                    return 0;
                } else {
                    return bandwidth * 0.001;
                }
            }
            if (token == "token") {
                const CONTRACT = tokenContract;
                const contract = await tronWeb.contract().at(CONTRACT);
                const tokenDecimal = await getDecimal('tron', tokenContract);

                const parameter1 = [
                    { type: 'address', value: toAddress },
                    { type: 'uint256', value: (amount * (10 ** tokenDecimal)).toString() },
                ];

                const transaction =
                    await tronWeb.transactionBuilder.triggerConstantContract(
                        CONTRACT,
                        'transfer(address,uint256)',
                        {},
                        parameter1,
                        fromAddress,
                    );

                console.log("chain:string, token:string, fromAddress:string, tokenContract:string, toAddress:string, amount:number")
                console.log(chain, token, fromAddress, tokenContract, toAddress, amount)
                const transactionHexStr = signedTx_.raw_data_hex.length;
                const transactionHexStr2 = signedTx_.signature[0].length;
                let bandwidth = transactionHexStr / 2 + transactionHexStr2 + 4;
                // const contract = await tronWeb.contract().at(CONTRACT);
                console.log('consumed bandwidth', bandwidth)
                let assetOfsenderAccount = await getAccountResource(fromAddress);
                console.log('assetOfsenderAccount', assetOfsenderAccount)
                let removeBandwidth = 0;
                if (assetOfsenderAccount.bandwidth < bandwidth) {// should get with trasaction tx length.
                    removeBandwidth = bandwidth * 0.001;
                }
                const energyToSun = (transaction.energy_used - assetOfsenderAccount.energy) * 420; //420 = getEnergyPrice
                // 1 TRX = 1000000 Sun 
                const calcTrx = (energyToSun / 1000000) + (removeBandwidth);
                console.log("calcTrx, assetOfsenderAccount.bandwidth, assetOfsenderAccount.energy", calcTrx, assetOfsenderAccount.bandwidth, assetOfsenderAccount.energy);
                return calcTrx;
            }
        }
    } catch (error: any) {
        console.log('estimateTransferFee', error)
    }
}
export const getBalance_ = async (chain: string, token: string, tokenContract: string, address: string) => {
    try {
        if (chain == "tron") {
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, process.env.TRON_PRIVATE_KEY);
            tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });
            if (token == 'coin') {
                const balance = await tronWeb.trx.getBalance(address)
                return balance / (10 ** 6);
            }
            if (token == "token") {
                const { abi } = await tronWeb.trx.getContract(tokenContract);
                const contract = tronWeb.contract(abi.entrys, tokenContract);
                let balance = await contract.methods.balanceOf(address).call();
                const tokenDecimal = await getDecimal('tron', tokenContract);
                balance = tronWeb.toDecimal(balance.toString()) / (10 ** tokenDecimal);
                return balance;
            }
        }
    } catch (error: any) {
        console.log('estimateTransferFee', error)
        return error;
    }
}
export const getBandwidthPrices = async (req: Request, res: Response) => {
    const options = {
        method: 'GET',
        url: `${TRON_NETWORK}/wallet/getbandwidthprices`,
        headers: { accept: 'application/json' }
    };
    const result = await axios.request(options);
    return result;
}
export const getChainParameters = async (req: Request, res: Response) => {
    const options = {
        method: 'GET',
        url: `${TRON_NETWORK}/wallet/getchainparameters`,
        headers: { accept: 'application/json' }
    };
    const result = await axios.request(options);
    return result;
}
export const getConsumedBandwidth = async (signedTx_:any) => {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io'
    });
    const txId = '27fa26eb3824cae10333af9e7ebf3b8645762381ed06a430840256b4f67a88ad';
    const signedTx = await tronWeb.trx.getTransaction(txId);
    

    const transactionHexStr = signedTx.raw_data_hex.length;
    const transactionHexStr2 = signedTx.signature[0].length;
    let bandwidth = transactionHexStr / 2 + transactionHexStr2 + 4
    console.log('getConsumedBandwidth ', bandwidth)
    
    return bandwidth;

}