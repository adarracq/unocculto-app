import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export const functions = {
    getIconSource,
    getRewardSource,
    getImageSource,
    shuffleArray,
    addSpacesInNumber,
    formatTime,
    convertImageToBase64,
    dateToString,
    stringDateToString,
    simpleDateToString,
}

function getIconSource(name: string) {
    switch (name) {
        case 'museum':
            return require('@/app/assets/icons/museum.png');
        case 'airplane-takeoff':
            return require('@/app/assets/icons/airplane-takeoff.png');
        case 'logo_white':
            return require('@/app/assets/images/logo_white.png');
        case 'chevron-down':
            return require('@/app/assets/icons/chevron-down.png');
        case 'book':
            return require('@/app/assets/icons/book.png');
        case 'palette':
            return require('@/app/assets/icons/palette.png');
        case 'flask':
            return require('@/app/assets/icons/flask.png');
        case 'flag':
            return require('@/app/assets/icons/flag.png');
        case 'capital':
            return require('@/app/assets/icons/capital.png');
        case 'fuel':
            return require('@/app/assets/icons/fuel.png');
        case 'target':
            return require('@/app/assets/icons/target.png');
        case 'clock':
            return require('@/app/assets/icons/clock.png');
        case 'gamepad':
            return require('@/app/assets/icons/gamepad.png');
        case 'profile':
            return require('@/app/assets/icons/profile.png');
        case 'cards':
            return require('@/app/assets/icons/cards.png');
        case 'duel':
            return require('@/app/assets/icons/duel.png');
        case 'books':
            return require('@/app/assets/icons/books.png');
        case 'mail':
            return require('@/app/assets/icons/mail.png');
        case 'arrow-left':
            return require('@/app/assets/icons/arrow-left.png');
        case 'arrow-right':
            return require('@/app/assets/icons/arrow-right.png');
        case 'king':
            return require('@/app/assets/icons/king.png');
        case 'student':
            return require('@/app/assets/icons/student.png');
        case 'compass':
            return require('@/app/assets/icons/compass.png');
        case 'fire':
            return require('@/app/assets/icons/fire.png');
        case 'gem':
            return require('@/app/assets/icons/gem.png');
        case 'change':
            return require('@/app/assets/icons/change.png');
        case 'lock':
            return require('@/app/assets/icons/lock.png');
        case 'check':
            return require('@/app/assets/icons/check.png');
        case 'journey':
            return require('@/app/assets/icons/journey.png');
        case 'rocket':
            return require('@/app/assets/icons/rocket.png');
        case 'globe':
            return require('@/app/assets/icons/globe.png');
        case 'paper_map':
            return require('@/app/assets/icons/paper_map.png');
        case 'close':
            return require('@/app/assets/icons/close.png');
        case 'lightning':
            return require('@/app/assets/icons/lightning.png');
        case 'coin':
            return require('@/app/assets/icons/coin.png');
        case 'people':
            return require('@/app/assets/icons/people.png');
        case 'peoples':
            return require('@/app/assets/icons/peoples.png');
        default:
            return require('@/app/assets/icons/none.png');
    }
}

function getImageSource(name: string) {
    switch (name) {
        case 'EUR':
            return require('@/app/assets/continents/europe.png');
        case 'ASI':
            return require('@/app/assets/continents/asia.png');
        case 'AFR':
            return require('@/app/assets/continents/africa.png');
        case 'AME':
            return require('@/app/assets/continents/america.png');
        case 'OCE':
            return require('@/app/assets/continents/oceania.png');
        case 'WLD':
            return require('@/app/assets/continents/world.png');
        default:
            return require('@/app/assets/icons/none.png');
    }
}


function getRewardSource(name: string) {
    switch (name) {
        case 'passport':
            return require('@/app/assets/rewards/passport.png');
        default:
            return require('@/app/assets/icons/none.png');
    }
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function addSpacesInNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatTime(seconds: number): string {
    // 600 return 10min
    // 90 return 1min30

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? mins + 'min ' : ''}${secs > 0 ? secs + 's' : ''}`.trim();
}


async function convertImageToBase64(imageSource: any) {
    try {
        // 1. Charger l'asset (résout le require('./...'))
        const asset = Asset.fromModule(imageSource);

        // 2. S'assurer que le fichier est téléchargé/copié dans le cache local du téléphone
        // C'est l'étape cruciale qui transforme le "projet" en "fichier réel"
        await asset.downloadAsync();

        // 3. Lire le fichier depuis le chemin local réel (file://...)
        // asset.localUri est le chemin que FileSystem peut lire
        if (!asset.localUri) {
            throw new Error("Impossible de récupérer l'URI local de l'image");
        }

        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
            encoding: 'base64',
        });

        return `data:image/png;base64,${base64}`;
    } catch (error) {
        console.error("Erreur conversion image:", error);
        return '';
    }
};

function stringDateToString(dateStr: string) {
    // input : 2026-02-03T07:00:00.000Z
    // output : 3 Février 2026
    const date = new Date(dateStr);
    const day = date.getUTCDate();
    const month = date.getUTCMonth(); // 0-11
    const year = date.getUTCFullYear();
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const dateFormatted = `${day} ${monthNames[month]} ${year}`;

    return dateFormatted;
}

function dateToString(date: number) {
    // exemple : -13800000000 -> Il y a 13,8 milliards d'années
    //12000000 -> Il y a 12 millions d'années
    //450000 -> Il y a 450 mille ans
    //-2600 -> 2600 avant J.-C.
    //724 -> 724 après J.-C.
    // 20231224 -> 24 Décembre 2023
    if (date < -1000000000) {
        if (date % 1000000000 === 0) {
            return `Il y a ${(-date / 1000000000).toFixed(0)} milliards d'années`;
        }
        return `Il y a ${(-date / 1000000000).toFixed(1)} milliards d'années`;
    }
    else if (date < -1000000) {
        if (date % 1000000 === 0) {
            return `Il y a ${(-date / 1000000).toFixed(0)} millions d'années`;
        }
        return `Il y a ${(-date / 1000000).toFixed(1)} millions d'années`;
    }
    else if (date < -1000) {
        return `Il y a ${(-date / 1000).toFixed(0)} 000 ans`;
    }
    else if (date < 0) {
        return `${-date} avant J.-C.`;
    }
    else if (date < 1000) {
        return `${date} après J.-C.`;
    }
    else if (date < 3000) {
        return `${date}`;
    }
    else {
        const dateStr = date.toString();
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
}

function simpleDateToString(date: number) {
    // exemple : -13800000000 -> 13,8 Md 
    //12000000 -> 12 M
    //450000 -> 450 k
    //-2600 -> 2600 av. J.-C.
    //724 -> 724
    // 20231224 -> 24/12/2023
    if (date < -1000000000) {
        if (date % 1000000000 === 0) {
            return `${-(-date / 1000000000).toFixed(0)} Md`;
        }
        return `${-(-date / 1000000000).toFixed(1)} Md`;
    }
    else if (date < -1000000) {
        if (date % 1000000 === 0) {
            return `${-(-date / 1000000).toFixed(0)} M`;
        }
        return `${-(-date / 1000000).toFixed(1)} M`;
    }
    else if (date < -1000) {
        if (date % 1000 === 0) {
            return `${-(-date / 1000).toFixed(0)} k`;
        }
        return `${-(-date / 1000).toFixed(1)} k`;
    }
    else if (date < 0) {
        return `${-date} av. J.-C.`;
    }
    else if (date < 10000) {
        return `${date}`;
    }
    else {
        const dateStr = date.toString();
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);
        return `${day}/${month}/${year}`;
    }
}