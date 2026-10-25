export const defaultImages = [
    '/assets/images/City_2.png', 
    '/assets/images/City_1.png',
    '/assets/images/Mobb_1.png',
    '/assets/images/Mobb_2.png',
    '/assets/images/WalpurgisterMeteor.jpg'
]

export function getRandomInt(max: number, min:number = 0){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}