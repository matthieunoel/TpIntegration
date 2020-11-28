import { Browser, Page } from 'puppeteer'

const ejs = require('ejs')
// const puppeteer = require('puppeteer')
// const printer = require('pdf-to-printer')
const uuidv1 = require('uuid/v1')
const fs = require('fs')
const fsPromise = require('fs').promises
const nodePath = require('path')
const Database = require('better-sqlite3')

import { performance } from 'perf_hooks'
// import { IPrint, ICard } from './root.controller'
import { AppConfig } from '../app'
import { Logger } from './root.logSystem'
import { config } from 'process'

export class RootService {

    private logger: Logger = new Logger()
    // private titre: string = 'Atelier Tests (KENORE Ahmed) : Matthieu NOEL, Cyril FURNON, Thomas Christophe.'

    async getLogs(guestId: number, paramUuid: string, all: boolean, dateStart: string, dateEnd: string) {

        const perfStart = performance.now()
        const uuid: string = uuidv1()

        try {

            let res: string = ''
            const month = await this.extendNumber(parseInt(('0' + (new Date(Date.now()).getMonth() + 1)).slice(-2), 10), 2)
            const year = await this.extendNumber(new Date(Date.now()).getFullYear(), 4)
            const actualLogPath: string = `./log/${year}-${month}.log`

            let logsList: string[] = []

            if (all) {

                const files = await fsPromise.readdir('./log/')

                for (let index = 0; index < files.length; index++) {
                    const file = files[index]
                    logsList.push(...(await fsPromise.readFile(`./log/${file}`)).toString().split('\r\n'))
                }

                this.logger.log(`getLogs[${uuid.slice(0, 6)}.] - ` + `Parameter "all" used succesfully` + ` - (${performance.now() - perfStart}ms)`)

            }
            else {

                logsList.push(...(await fsPromise.readFile(actualLogPath)).toString().split('\r\n'))

            }

            if (guestId != undefined || paramUuid != undefined) {

                if (paramUuid == undefined) {

                    console.log(guestId)
                    const db = new Database('./db/facial.db')
                    const request = `SELECT processUuid FROM guest WHERE id=${guestId}`
                    paramUuid = db.prepare(request).get().processUuid
                    this.logger.log(`onlyPeopleIn[${uuid.slice(0, 6)}.] - ` + `SQLITE:"${request}": Ok` + ` - (${performance.now() - perfStart}ms)`)
                    db.close()
                }

                const tmpList: string[] = logsList
                logsList = []

                for (let index = 0; index < tmpList.length; index++) {
                    const log = tmpList[index]
                    if (log.toString().includes(`[${paramUuid.slice(0, 6)}.]`)) {
                        logsList.push(log)
                    }
                }

                this.logger.log(`getLogs[${uuid.slice(0, 6)}.] - ` + `Parameters "guestId" or "uuid" used succesfully` + ` - (${performance.now() - perfStart}ms)`)

            }

            if (dateStart != undefined) {

                const dateReference: Date = new Date(dateStart)

                const tmpList: string[] = logsList
                logsList = []

                for (let index = 0; index < tmpList.length; index++) {
                    const log = tmpList[index]
                    const comparedDate: Date = new Date(tmpList[index].slice(6, 25).replace(' ', 'T'))
                    if (comparedDate >= dateReference) {
                        logsList.push(log)
                    }
                }

                this.logger.log(`getLogs[${uuid.slice(0, 6)}.] - ` + `Parameter "dateStart" used succesfully` + ` - (${performance.now() - perfStart}ms)`)

            }

            if (dateEnd != undefined) {

                const dateReference: Date = new Date(dateEnd)

                const tmpList: string[] = logsList
                logsList = []

                for (let index = 0; index < tmpList.length; index++) {
                    const log = tmpList[index]
                    const comparedDate: Date = new Date(tmpList[index].slice(6, 25).replace(' ', 'T'))
                    if (comparedDate <= dateReference) {
                        logsList.push(log)
                    }
                }

                this.logger.log(`getLogs[${uuid.slice(0, 6)}.] - ` + `Parameter "dateEnd" used succesfully` + ` - (${performance.now() - perfStart}ms)`)

            }

            if (logsList.length > 0) {

                for (let index = 0; index < logsList.length; index++) {
                    const log = logsList[index]
                    if (log !== '') {
                        res += `${await this.extendNumber(index + 1, (logsList.length + 1).toString().split('').length)} - ${log}\r\n`
                    }
                }

            } else {
                res = 'There are no logs'
            }

            const perfEnd: number = performance.now() - perfStart
            this.logger.log(`getLogs[${uuid.slice(0, 6)}.] - ` + `Process completed successfully.` + ` - (${perfEnd}ms)`)

            return res

        } catch (error) {

            this.logger.error(`getLogs[${uuid.slice(0, 6)}.] - ` + error.toString() + ` - (${performance.now() - perfStart}ms)`)
            throw error

        }

    }

    async main(): Promise<string> {

        try {
            const perfStart = performance.now()
            const uuid: string = uuidv1()

            const params = {
                titre: AppConfig.titre
            }

            return new Promise<string>(async (resolve, reject) => {

                await ejs.renderFile('./src/root/main.html', params, { async: true }, (err: any, str: any) => {
                    const perfEnd: number = performance.now() - perfStart
                    resolve(str)
                    this.logger.log(`main[${uuid.slice(0, 6)}.] - ` + `Process completed successfully.` + ` - (${perfEnd}ms)`)
                })
            })
        } catch (error) {
            return new Promise<string>(async (resolve, reject) => {

                reject(error)

            })
        }

    }

    async load(query: string, path: string) {

        const perfStart = performance.now()
        const uuid: string = uuidv1()

        return new Promise<string>(async (resolve, reject) => {
            try {

                let res = query;

                if (query === 'generate') {
                    try {
                        this.CreateDbFileIfNotExists(AppConfig.dbPath)
                        this.CreateTableClient(AppConfig.dbPath)
                        res = `La génération de la base s'est effectuée avec succcès. La table "Client" a été crée.`
                    } catch (error) {
                        res = 'Erreur lors de la génération de la base de donnée : ' + error
                    }
                } else if (query === 'import' && path !== undefined) {
                    try {
                        if (!fs.existsSync(AppConfig.dbPath)) {
                            throw new Error('Aucune base de donnée trouvée.')
                        }
                        const data = await this.ExtratContentFromFile(path)
                        this.InsertSQLRequest(AppConfig.dbPath, await this.GenerateDbInserts(data))
                        if (!this.CheckClientDataInTableClient(AppConfig.dbPath, data)) {
                            throw new Error('Les données du fichier et les données en base ne correspondent pas.')
                        }
                        res = `Import du fichier "${path} effectué avec succès."`
                    } catch (error) {
                        res = 'Erreur lors de l\'insertion des données : ' + error;
                    }
                } else {
                    res = 'Erreur : requête non valide.'
                }

                // CODE

                const params = {
                    res,
                    titre: AppConfig.titre
                }

                await ejs.renderFile('./src/root/after.html', params, { async: true }, (err: any, str: any) => {
                    resolve(str)
                    this.logger.log(`load[${uuid.slice(0, 6)}.] - ` + `Process completed successfully.` + ` - (${performance.now() - perfStart}ms)`)
                })

            } catch (error) {
                this.logger.error(`load[${uuid.slice(0, 6)}.] - ` + `Error : ${error}.` + ` - (${performance.now() - perfStart}ms)`)
                reject(error)
            }
        })
    }

    public async checkFolders() {

        try {
            fs.mkdirSync('./db/')
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error
            }
        }

        try {
            fs.mkdirSync('./log/')
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error
            }
        }

    }

    private async extendNumber(value: number, extraZero: any) {
        // await this.logger.checkLogFiles()
        const valueStr: string = value.toString()
        if (valueStr.length < extraZero) {
            let zeroStr: string = ''
            for (let index = 0; index < extraZero - valueStr.length; index++) {
                zeroStr += '0'
            }
            return zeroStr + valueStr
        }
        else {
            // this.logger.warn(`It would be time to purge the base, this warning appears only if the id value is higher than a number with ${extraZero} numerals`)
            return valueStr
        }
    }

    // public async createDBIfNotExist() {
    //         const db = new Database('./db/SQLite.db')


    //         db.close()
    // }

    // public async InitDB() {

    //     const perfStart = performance.now()
    //     const uuid: string = uuidv1()

    //     try {
    //         const db = new Database('./db/SQLite.db')
    //         let request: string = ''
    //         request = 'CREATE TABLE IF NOT EXISTS client(id INTEGER PRIMARY KEY AUTOINCREMENT, guid TEXT, first TEXT, last TEXT, street TEXT, city TEXT, zip NUMERIC);'
    //         db.prepare(request).run()

    //         request = 'SELECT COUNT(*) as "nbLignes" FROM client'
    //         let res = db.prepare(request).all()
    //         // console.log(res)


    //         if (res[0].nbLignes === 0) {

    //             this.logger.log(`InitDB[${uuid.slice(0, 6)}.] - ` + `Starting adding data from "./src/static/clients.csv"` + ` - (${performance.now() - perfStart}ms)`)

    //             const data: any = (await fsPromise.readFile('./src/static/clients.csv')).toString().replace('guid;first;last;street;city;zip\r\n', '').split('\r\n')

    //             // tslint:disable-next-line: prefer-for-of
    //             for (let index = 0; index < data.length; index++) {
    //                 const line = data[index].split(';')
    //                 //  client(id INTEGER PRIMARY KEY AUTOINCREMENT, guid TEXT, first TEXT, last TEXT, street TEXT, city TEXT, zip NUMERIC)
    //                 if (line.length >= 1) {
    //                     request = `INSERT INTO client (guid, first, last, street, city, zip) VALUES ('${line[0]}', '${line[1]}', '${line[2]}', '${line[3]}', '${line[4]}', ${line[5]})`
    //                     db.prepare(request).run()
    //                 }
    //                 // console.log('request', request)
    //             }

    //             this.logger.log(`InitDB[${uuid.slice(0, 6)}.] - ` + `Data insertion : ` + ` - (${performance.now() - perfStart}ms)`)
    //         }

    //         db.close()

    //     } catch (error) {
    //         this.logger.error(`InitDB[${uuid}] - ` + error.toString() + ` - (${performance.now() - perfStart}ms)`)
    //         throw error
    //     }
    // }

    public CreateDbFileIfNotExists(dbPath: string) {
        const db = new Database(dbPath)
    }

    public async CreateTableClient(dbPath: string) {
        const db = new Database(dbPath)
        let request: string = ''
        request = 'CREATE TABLE IF NOT EXISTS client(id TEXT PRIMARY KEY, nom TEXT, prenom TEXT, adresse TEXT);'
        db.prepare(request).run()
    }

    public async ExtratContentFromFile(filePath: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                resolve((await fsPromise.readFile(filePath)).toString())
            } catch (error) {
                reject(error)
            }
        })
    }

    public async GenerateDbInserts(data: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {


                let formatedData = data.split('\r\n')

                let res: string = 'INSERT INTO client (id, nom, prenom, adresse) VALUES'

                // tslint:disable-next-line: prefer-for-of
                for (let index = 0; index < formatedData.length; index++) {
                    const line = formatedData[index].split(';')
                    if (line.length >= 1) {
                        const request = ` ('${line[0]}', '${line[1]}', '${line[2]}', '${line[3]}'),`
                        res += request
                    }
                }

                res = res.replace(/.$/, ';')

                resolve(res)

            } catch (error) {
                reject(error)
            }
        })
    }

    public async InsertSQLRequest(dbPath: string, request: string) {
        new Database(dbPath).prepare(request).run()
    }

    public async CheckClientDataInTableClient(dbPath: string, data: string) {
        let clientsDb = new Database(dbPath).prepare('SELECT * FROM client;').all()
        // console.log(clients)
        const formatedData = data.split('\r\n')
        let clientsData = []
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < formatedData.length; index++) {
            const data = formatedData[index].split(';');
            clientsData.push({
                id: data[0],
                nom: data[1],
                prenom: data[2],
                adresse: data[3]
            })
        }
        return clientsData === clientsDb
    }
}