export function log(level: string, message: string) {
    console.log(`[${getFormattedDate(new Date())}] [${level.toUpperCase()}] ${message}`);
}

export function getFormattedDate(d: Date) {
    return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
}