
let randUtils = {
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    //Floating point number, two decimal places
    getRandomFloat: function(min, max) {
        var number = Math.random() * (max - min) + min;
        var factor = Math.pow(10, 2);
        var tempNumber = number * factor;
        var roundedTempNumber = Math.round(tempNumber);
        return roundedTempNumber / factor;
    },

    //helper function to get a random element from an array
    getRandomElement: function(arr) {
        //randomInt does not include the max val, so don't subtract 1 from length
        return arr[this.getRandomInt(0, arr.length)];
    }
}

module.exports = randUtils;