import { loadPersistentData, savePersistentData } from '../utils';

const configuration = loadPersistentData('config', {});

export function saveConfig(guildId: string, namespace: string, config: any) {
    if (!configuration.hasOwnProperty(guildId)) {
        configuration[guildId] = { [namespace]: config };
    } else {
        configuration[guildId][namespace] = config;
    }

    savePersistentData('config', configuration);
}

export function getConfig(guildId: string, namespace: string, defaultValue: any) {
    if (!configuration.hasOwnProperty(guildId)) {
        configuration[guildId] = { [namespace]: defaultValue };
    } else if (!configuration[guildId].hasOwnProperty(namespace)) {
        configuration[guildId][namespace] = defaultValue;
    }

    return configuration[guildId][namespace];
}