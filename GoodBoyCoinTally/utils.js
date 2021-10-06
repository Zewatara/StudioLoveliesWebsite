module.exports = {
    selectFromDB(connection, callback, table, row, query) {
        if (row && query) query = " WHERE " + row + "='" + query + "'";
        else query = "";
        try {
            connection.query("SELECT * FROM " + table + query, function(err, resp, fields) {
                if (err || resp[0] === undefined) {
                    console.log(err);
                    callback(false, "This value doesn't exist");
                    return;
                }
                callback(true, resp);
            });
        } catch (err) {
            callback(false, err);
            return;
        }
    },

    existsInTable(connection, table, row, query, callback) {
        connection.query("SELECT EXISTS(SELECT * FROM " + table + " WHERE " + row + "='" + query + "')", function(err, resp, field) {
            if (err) {
                callback(false, err);
                return;
            }
            if (resp[0][Object.keys(resp[0])[0]] == 0) callback(false);
            else callback(true);
        });
    },


    insertToDB(connection, table, row, value, callback) {
        if (row != "") {
            if (Array.isArray(row)) row = " (" + row.join(", ") + ")";
            else row = " (" + row + ")";
        }

        if (Array.isArray(value)) value = "('" + value.join("', '") + "')";
        else value = "('" + value + "')";

        console.log("INSERT INTO " + table + row + " VALUES " + value + ";");
        connection.query("INSERT INTO " + table + row + " VALUES " + value + ";");
        callback();
    },


    updateRow(connection, table, row, value, anchor, callback) {
        connection.query("UPDATE " + table + " SET " + row + "=" + value + " WHERE " + anchor[0] + "='" + anchor[1] + "';");
        callback();
    },

    rawQuery(connection, query, callback) {
        connection.query(query, function(err) {
            if (err) {
                callback(false, err);
                return;
            } else callback(true);
        });
    },

    generateId(length) {
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var result = "";
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    },

    isInt(n) {
        return n % 1 === 0;
    },

    clean(text) {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }

};