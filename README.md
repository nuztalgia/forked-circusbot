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
    "BOT_TOKEN": "YOUR_SECRET_BOT_TOKEN",
    "BOT_PREFIX": "!",
    "PERMISSIONS": {
        "814616443919532062": ["*"],
        "730401144773410927": ["*"],
        "730432239325806632": ["event_help", "ping_event"]
    }
}
```
