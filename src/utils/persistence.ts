const fs = require('fs');

export function savePersistentData(namespace: string, data: object) {
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }

    fs.writeFileSync(`data/${namespace}.json`, JSON.stringify(data, null, 2));
}

export function loadPersistentData(namespace: string, defaultValue: object): any {
    if (fs.existsSync(`data/${namespace}.json`)) {
        const data = fs.readFileSync(`data/${namespace}.json`);
        return JSON.parse(data);
    } else {
        return defaultValue;
    }
}