import { randomInt } from 'crypto';

export function generatePassword(length = 6) : string {
    if (length < 6) throw new Error('Password length should be at leats 6 characters');

    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+[]{}/?><';
    const all = upper + lower + numbers + specials;

    const guranteed = [
        upper[randomInt(0, upper.length)],
        lower[randomInt(0, lower.length)],
        numbers[randomInt(0, numbers.length)],
        specials[randomInt(0, specials.length)],
    ];
    
    const remaining: string[] = [];
    for (let i = 0; i < length - guranteed.length; i++) {
        remaining.push(all[randomInt(0, all.length)]);
    }
    const arr = guranteed.concat(remaining);

    for (let i = arr.length -1; i > 0; i--){
        const j = randomInt(0, i + 1);
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    return arr.join('');
}


