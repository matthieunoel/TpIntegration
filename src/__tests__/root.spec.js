const RootService = require("../root/root.service").RootService;
const AppConfig = require("../app").AppConfig;
const fs = require('fs')
const Database = require('better-sqlite3');
const dbPath = '<rootDir>/db/SQLiteTest.db';

function DeleteFileIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

testDbPath = './db/test.db'

describe('AppComponent', () => {

    it('Devrais avoir créer la base de donnée', () => {
        DeleteFileIfExists(testDbPath);
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(testDbPath);
        const fileExist = fs.existsSync(testDbPath);
        expect(fileExist).toBe(true);
    });

    it('Devrais avoir créer la table Client', () => {
        DeleteFileIfExists(dbPath);
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(testDbPath);
        rootService.CreateTableClient(testDbPath);
        // Si aucune erreur ne pète, c'est que la table existe.
        // On pends l'id -1 car aucune client n'as pour id le -1, ce qui va potentiellement accélérer la requête/
        const request = 'SELECT * FROM CLIENT WHERE id=-1;';
        var res = new Database(testDbPath).prepare(request).get();
        expect(res).toBe(undefined);
    });

});