class Utils {
    static insert(original, str, index) {
        if (index > 0) {
            return original.substring(0, index) + str + original.substring(index);
        } else {
            return str + this;
        }
    }

    static getCommandsListForChannel(channel) {

    }
}

module.exports = Utils;