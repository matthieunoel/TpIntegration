const RootService = require("../root/root.service").RootService;
const AppConfig = require("../app").AppConfig;
const fs = require('fs')

describe('AppComponent', () => {

    it('should have total equal 0', () => {
        const rootService = new RootService();
        rootService.CreateDbFileIfNotExists(AppConfig.dbPath);
        const fileExist = fs.existsSync(AppConfig.dbPath);
        expect(fileExist).toBe(true);
    });

});
