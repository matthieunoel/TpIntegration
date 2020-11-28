const RootService = require("../root/root.service").RootService;
const AppConfig = require("../app").AppConfig;
const fs = require('fs')
const Database = require('better-sqlite3');
const dbPath = '<rootDir>/db/SQLiteTest.db';

function DeleteFileIfExists (filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath);
    }
}


describe('AppComponent', () => {

    it('Devrais avoir créer la base de donnée', () => {
        // DeleteFileIfExists(AppConfig.dbPath);
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(AppConfig.dbPath);
        const fileExist = fs.existsSync(AppConfig.dbPath);
        expect(fileExist).toBe(true);
    });

    it('Devrais avoir créer la table CLient', () => {
        // DeleteFileIfExists(dbPath);
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(AppConfig.dbPath);
        const fileExist = fs.existsSync(AppConfig.dbPath);
        rootService.CreateTableClient(AppConfig.dbPath);
        const request = 'DESCRIBE CLIENT;';
        var test = new Database(AppConfig.dbPath).prepare(request).run();
        expect(test).toBe(true);
    });

});
