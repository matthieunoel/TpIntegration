import 'reflect-metadata'
import { createExpressServer, useContainer } from 'routing-controllers'
import { RootController } from './root/root.controller'
const express = require('express')
import Container from 'typedi'

useContainer(Container)

export class AppConfig {

  public static Port: number = 5000
  // public static Ip: string = '192.168.1.105'
  public static Ip: string = '127.0.0.1'
  public static OnLinux: boolean = false
  public static devToolsActivated: boolean = false
  public static dbPath: string = './db/SQLite.db'
  public static titre: string = 'Atelier Tests (KENORE Ahmed) : Matthieu NOEL, Cyril FURNON, Thomas Christophe.'

}

const app = createExpressServer({
  cors: true,
  controllers: [RootController]
})

// app.use('/spec', express.static('src/global/settings/ARM-settings'))
app.use('/static', express.static('src/static'))

app.listen(AppConfig.Port, AppConfig.Ip)