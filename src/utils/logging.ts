import { getFormattedDate } from './misc';

export function log(level: string, message: string) {
    console.log(`[${getFormattedDate(new Date())}] [${level.toUpperCase()}] ${message}`);
}
