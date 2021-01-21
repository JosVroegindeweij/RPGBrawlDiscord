function insert(original, str, index) {
    if (index > 0) {
        return original.substring(0, index) + str + original.substring(index);
    } else {
        return str + this;
    }
}

function timestamp() {
    let dateObj = new Date();
    let date = ("0" + dateObj.getDate()).slice(-2);
    let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    let year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    let seconds = dateObj.getSeconds();
    let ms = dateObj.getMilliseconds();

    return `[${year}-${month}-${date} ${hours}:${minutes}:${seconds}:${ms}]`;
}

module.exports = {
    insert,
    timestamp
};