const RootService = require("../root/root.service").RootService;
const AppConfig = require("../app").AppConfig;
const fs = require('fs')
const fsPromise = require('fs').promises
const Database = require('better-sqlite3');
const dbPath = '<rootDir>/db/SQLiteTest.db';

function DeleteFileIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

describe('AppComponent', () => {

    // Unit tests

    it('CreateDbFileIfNotExists() crée bien la base de donnée.', () => {
        const testDbPath = './db/test01.db'
        DeleteFileIfExists(testDbPath);
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(testDbPath);
        const fileExist = fs.existsSync(testDbPath);
        expect(fileExist).toBe(true);
    });

    it('CreateTableClient() crée bien la table Client.', () => {
        const testDbPath = './db/test02.db'
        DeleteFileIfExists(testDbPath);
        const rootService = new RootService();
        // rootService.CreateDbFileIfNotExists(testDbPath);
        new Database(testDbPath)
        rootService.CreateTableClient(testDbPath);
        // Si aucune erreur ne pète, c'est que la table existe et que les champs aussi.
        // On pends l'id -1 car aucune client n'as pour id le -1, ce qui va potentiellement accélérer la requête/
        const request = 'SELECT id, nom, prenom, adresse FROM CLIENT WHERE id=-1;';
        var res = new Database(testDbPath).prepare(request).get();
        expect(res).toBe(undefined);
    });

    it('ExtratContentFromFile() extrait bien les données.', async() => {
        const testFilePath = './src/__tests__/testFile.txt'
        const ExpetedResult = 'This is the content of the test File. &é"\'(-è_çà)1234567890~#{[|`\\^@]}'
        const rootService = new RootService();
        var res = await rootService.ExtratContentFromFile(testFilePath)
        expect(res).toBe(ExpetedResult);
    });

    it('GenerateDbInserts() genère bien des inserts à partir de données.', async() => {
        const testDataString = 'IDRDN;NOMTEST;PRENOMTEST;EM@ILTEST'
        const ExpetedResult = "INSERT INTO client (id, nom, prenom, adresse) VALUES ('IDRDN', 'NOMTEST', 'PRENOMTEST', 'EM@ILTEST');"

        const rootService = new RootService();
        var res = await rootService.GenerateDbInserts(testDataString)
        expect(res).toBe(ExpetedResult);
    });

    it('InsertSQLRequest() effectue bien les inserts.', async() => {
        const testDbPath = './db/test03.db'

        const testDataString = "INSERT INTO client (id, nom, prenom, adresse) VALUES ('IDRDN', 'NOMTEST', 'PRENOMTEST', 'EM@ILTEST');"
        const ExpetedResult = {
            'id': 'IDRDN',
            'nom': 'NOMTEST',
            'prenom': 'PRENOMTEST',
            'adresse': 'EM@ILTEST'
        }

        DeleteFileIfExists(testDbPath)

        const rootService = new RootService();

        const db = new Database(testDbPath)
        rootService.CreateTableClient(testDbPath);

        await rootService.InsertSQLRequest(testDbPath, testDataString)

        const request = 'SELECT id, nom, prenom, adresse FROM CLIENT;';
        const res = db.prepare(request).get();

        expect(res).toEqual(ExpetedResult);
    });

    // Not Unit tests lol

    it('La base de donnée peut se générer avec ses tables.', async() => {
        const testDbPath = './db/test04.db'
        DeleteFileIfExists(testDbPath)
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(testDbPath);
        rootService.CreateTableClient(testDbPath);
    });

    it('L\'import des données s\'effectue correctement.', async() => {
        const testDbPath = './db/test05.db'

        const testFilePath = './src/__tests__/client.test.txt'
        const expectedData = "01A;Arthurur;DESMON;arthur@desmon@epsi.fr\r\n02E;Eve;WALTER;eve.walter@epsi.fr\r\n03F;Frederic;ROBERT;frederic.robert@epsi.fr"
        const expectedSQLReq = "INSERT INTO client (id, nom, prenom, adresse) VALUES ('01A', 'Arthurur', 'DESMON', 'arthur@desmon@epsi.fr'), ('02E', 'Eve', 'WALTER', 'eve.walter@epsi.fr'), ('03F', 'Frederic', 'ROBERT', 'frederic.robert@epsi.fr');"

        DeleteFileIfExists(testDbPath)

        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(testDbPath);
        rootService.CreateTableClient(testDbPath);

        const data = await rootService.ExtratContentFromFile(testFilePath)
        expect(data).toEqual(expectedData);
        const SqlReq = await rootService.GenerateDbInserts(data)
        expect(SqlReq).toEqual(expectedSQLReq)


        await rootService.InsertSQLRequest(testDbPath, SqlReq)

        let clientsDb = new Database(testDbPath).prepare('SELECT * FROM client;').all()
        const formatedData = expectedData.split('\r\n')
        let clientsData = []
        for (let index = 0; index < formatedData.length; index++) {
            const client = formatedData[index].split(';');
            clientsData.push({
                id: client[0],
                nom: client[1],
                prenom: client[2],
                adresse: client[3]
            })
        }

        expect(clientsDb).toEqual(clientsData)
    });

});