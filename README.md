# Installation

```
npm i -g yarn
npm i -g nodemon
sudo yarn install
```

Then, edit "./src/app.ts", put you're ip address and set the config you want.

Finally,

```
npm run start-wnd / npm run start-linux
```

If you have some issues installing the server on windows, follow instructions of this :
https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md

# Request list :

- GET : "/" : Give you info about the server
- GET: "/getLogs" (Params(not required): all(boolean), guestId(number), uuid(string), dateStart(string), dateEnd(string)) : Permit to check logs, these parameters are options. "all" permit to see all logs, not only this month. guestId, uuid, dateStart, dateEnd are filters. dateStart and dateEnd have to be this way : "YYYY-MM-DDThh:mm:ss", for example, "2020-03-24T11:15:00"
