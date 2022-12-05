export function getFormattedDate(d: Date | null) {
    if (d === null) return 'Unknown/Invalid Date';
    return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
}

export function diffDate(date1: Date, date2: Date) {
    return (date2.getTime() - date1.getTime()) / 1000;
}

export function arrayRandom(arr: any[]) {
    return arr[Math.floor(Math.random()*arr.length)];
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.
    floor(Math.random() * (max - min + 1)) + min;
}

export function randomStr(length: number) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}