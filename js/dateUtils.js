
let dateUtils = {
    //For formatting dates with leading zero
    pad: function (num, size = 2) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    },

    generateDateString(rowDate) {
        if(typeof(rowDate) === 'number') {
            rowDate = new Date(rowDate);
        }
        let result = rowDate.getUTCFullYear() + '-' + this.pad(rowDate.getUTCMonth()+1) + '-' +
            this.pad(rowDate.getUTCDate()) + 'T' + this.pad(rowDate.getUTCHours()) + ':' +
            this.pad(rowDate.getUTCMinutes()) + ':' + this.pad(rowDate.getUTCSeconds()) + '.000Z';
        return result;
    }
}

module.exports = dateUtils;