function insert(original, str, index) {
    if (index > 0) {
        return original.substring(0, index) + str + original.substring(index);
    } else {
        return str + this;
    }
}

function timestamp() {
    let dateObj = new Date();
    let date = lpad(dateObj.getDate(), 2);
    let month = lpad(dateObj.getMonth() + 1, 2);
    let year = dateObj.getFullYear();
    let hours = lpad(dateObj.getHours(), 2);
    let minutes = lpad(dateObj.getMinutes(), 2);
    let seconds = lpad(dateObj.getSeconds(), 2);
    let ms = lpad(dateObj.getMilliseconds(), 3);
    return `[${year}-${month}-${date} ${hours}:${minutes}:${seconds}:${ms}]`;
}

function lpad(value, significance) {
    return ('0'.repeat(significance) + value).slice(-significance);
}

module.exports = {
    insert,
    timestamp
};