export default function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}