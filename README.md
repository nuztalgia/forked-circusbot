README
======

Use Node.js 16 or higher.

```
npm install
npm run build; node .\cirque-bot.js
```

Sample `config.json` file:

```
{
    "BOT_CLIENT_ID": "912376778939584562",
    "BOT_TOKEN": "YOUR_SECRET_BOT_TOKEN",
    "BOT_PREFIX": "!",
    "PERMISSIONS": {
        "814616443919532062": ["*"],
        "730401144773410927": ["*"],
        "730432239325806632": ["event_help", "ping_event"]
    }
}
```

Authorization URL:

```
https://discord.com/api/oauth2/authorize?client_id=912376778939584562&permissions=271969344&scope=bot%20applications.commands
```

Docker Stuff
============

**Linux:**

```
docker build -t circusbot .
docker run -itd -v /usr/src/circusbot/data:/usr/src/app/data -v /usr/src/circusbot:/usr/src/app circusbot
```
