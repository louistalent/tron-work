export interface QueryResult {
    type: string;
    message: string;
}

export interface CheckObject {
    column: string;
    condition: string
    data: any;
    type: string;
}