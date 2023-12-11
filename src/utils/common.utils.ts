import crypto from 'crypto';
import * as dataAccess from "../utils/dataAccess.utils"

//It is recommended to use ethers4.0.47 version
import ethers from 'ethers';

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

/** create random code /2023-06-28/jino*/
export const generateRandomCode = (length: number): string => {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength: number = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

/** create random number /2023-07-01/jino */
export const generateRandomNumber = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10); // generates a random number between 0 and 9
    }
    return result;
}

/** create random number /2023-07-01/jino */
export const hashWithSHA256 = (password: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(process.env.SALT + password);
    return hash.digest('hex');
}

export const timeAgo = (dateString: string): string => {
    const date: Date = new Date(dateString);
    const now: Date = new Date();
    const seconds: number = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes: number = Math.round(seconds / 60);
    const hours: number = Math.round(minutes / 60);
    const days: number = Math.round(hours / 24);
    const years: number = Math.round(days / 365);

    if (seconds < 60) return `${seconds} second ago`;
    if (minutes < 60) return `${minutes} minute ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 365) return `${days} day ago`;
    return `${years} years ago`;
}

export const dateFormat = (dateString: string): string => {
    if(dateString == null) return '';
    
    const date: Date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

export const dateFormat1 = (dateString: string): string => {
    const date: Date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
