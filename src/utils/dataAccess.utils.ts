import db from "../config/database.config"
import { QueryResult, CheckObject } from "../types/database.types"

export const selectOne = (sql:string, values: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {       
        db.query(sql, values, (err: any, rows: any) => {
            if(err) { 
                reject(err)
                console.log(err)
            } else {
                resolve(rows[0])
            }
        })
    })
}

export const selectAll = (sql:string, values: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {       
        db.query(sql, values, (err: any, rows: any) => {
            if(err) { 
                reject(err)
                console.log(err)
            } else {
                resolve(rows)
            }
        })
    })
}

export const insert = (sql: string, values: any[]): Promise<QueryResult> => {
    return new Promise<QueryResult>((resolve, reject) => {
        db.query(sql, values, (err: any) => {
            if (err) {
                reject({ error: err });
                console.log(err);
            } else {
                resolve({
                    type: "INSERT",
                    message: "Complete"
                });
            }
        });
    });
}

export const update = (sql: string, values: any[]): Promise<QueryResult> => {
    return new Promise<QueryResult>((resolve, reject) => {
        db.query(sql, values, (err: any) => {
            if (err) {
                reject({ error: err });
                console.log(err);
            } else {
                resolve({
                    type: "UPDATE",
                    message: "Complete"
                });
            }
        });
    });
}

export const remove = (sql: string, values: any[]): Promise<QueryResult> => {
    return new Promise<QueryResult>((resolve, reject) => {
        db.query(sql, values, (err: any) => {
            if (err) {
                reject({ error: err });
                console.log(err);
            } else {
                resolve({
                    type: "UPDATE",
                    message: "Complete"
                });
            }
        });
    });
}

export const findOne = async (table:string, select: string, ...where: CheckObject[]): Promise<any> => {
    let sql: string = `SELECT ${select} FROM ${table} WHERE `
    let values: any[] = []

    where.forEach((v, i, arr) => {
        if(i != 0)
            sql += `${v.type} `
        sql += `${v.column} ${v.condition} ? `
        values.push(v.data)
    })

    return new Promise((resolve, reject) => {
        db.query(sql, values, (err: any, rows: any) => {
            if(err) { 
                reject(err)
                console.log(err)
            } else {
                resolve(rows[0])
            }
        })
    })
}

export const findAll = async (table:string, select: string, ...where: CheckObject[]): Promise<any> => {
    let sql: string = `SELECT ${select} FROM ${table} WHERE `
    let values: any[] = []

    where.forEach((v, i, arr) => {
        if(i != 0)
            sql += `${v.type} `
        sql += `${v.column} ${v.condition} ? `
        values.push(v.data)
    })

    return new Promise((resolve, reject) => {
        db.query(sql, values, (err: any, rows: any) => {
            if(err) { 
                reject(err)
                console.log(err)
            } else {
                resolve(rows)
            }
        })
    })
}
