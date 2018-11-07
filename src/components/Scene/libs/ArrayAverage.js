export default function arrayAverage(array) {
    let xsum = 0;
    let ysum = 0;
    for (var i = 0; i < array.length; i++) {
        xsum += array[i].position.x; //don't forget to add the base
        ysum += array[i].position.y;
    }
    return [xsum / array.length, ysum / array.length]
}

