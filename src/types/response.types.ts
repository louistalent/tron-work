export interface Result {
    code: number;
    message: string;
}

export interface ResultEmailSendSuccess {
    code: number;
    message: string;
    timeout: number;
}

export interface ResultAccessTokenExpired {
    name: string;
    message: string;
    expiredAt: string;
}