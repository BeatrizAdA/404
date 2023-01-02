"use strict";
class DAOUsers{
    constructor(pool){
        this.pool = pool;
    }

    loginUser(email, password, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM user WHERE email = ? AND password = ?" , [email,password],
                function(err, rows) {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if (rows.length === 0) {
                        callback(null, false); //no está el usuario con el password proporcionado
                    }
                    else {
                        callback(null, rows);
                    
                    }
                });
            }
        });
    }

    existingUser(email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM user WHERE email = ?" , [email],
                function(err, rows) {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        if (rows.length != 0) {
                            callback(null, true); //no existe el usuario
                        }
                        else {
                            callback(null, false);
                        }
                    }
                });
            }
        });
    }

    createUser(email, password, name, img, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("INSERT INTO user (email, password, name, img) VALUES (?, ?, ?, ?)", [email, password, name, img],
                function(err, rows) {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                         callback(null, true);
                    }
                });
            }
        });
    }

    getUser(email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM user WHERE email = ?" , [email],
                function(err, rows) {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        if (rows.length === 0) {
                            callback(null, false); //no está el usuario con el password proporcionado
                        }
                        else {
                            callback(null, rows[0]);
                        }
                    }
                });
            }
        });
    }

    getUserImage(email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT img FROM user WHERE email = ?" , [email],
                function(err, rows) {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        if (rows.length === 0) {
                            callback(null); //no está el usuario con el password proporcionado
                        }
                        else {
                            callback(null, rows[0].img);
                        }
                    }
                });
            }
        });
    }
}

module.exports=DAOUsers;
