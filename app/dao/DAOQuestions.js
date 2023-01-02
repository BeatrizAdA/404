"use strict";

class DAOQuestions {

    constructor(pool) {
        this.pool = pool;
    }

    getQuestions(callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("SELECT U.email, U.name, U.img, Q.id, Q.title, Q.body, Q.date, T.tag FROM user U INNER JOIN questions Q ON U.email = Q.email INNER JOIN questionstag QT ON QT.idQuestion = Q.id INNER JOIN tag T ON  T.id = QT.idTag ORDER BY Q.date DESC",
                    function(err, rows) {
                        if (err) {
                            connection.release();
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            var questions = [];
                            if (rows.length != 0) {
                                var count = 0;
                                rows.forEach(function(value, index, array) {
                                    if (index > 0 && array[index - 1].id === value.id) {
                                        count = count + 1;
                                        questions[index - count].tags.push(value.tag);
                                    } else {
                                        var question = new Object();
                                        question.id = value.id;
                                        question.title = value.title;
                                        question.body = value.body;
                                        question.date = new Date(value.date).toDateString();
                                        question.name = value.name;
                                        question.email = value.email;
                                        question.img = value.img;
                                        question.tags = [];
                                        if (value.tag !== null) question.tags.push(value.tag);
                                        questions.push(question);
                                    }
                                });
                            }
                            connection.release();
                            callback(null, questions);
                        }
                    });
            }
        });
    }

    getQuestion(id, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("SELECT U.email, U.name, U.img, Q.id, Q.title, Q.body, Q.date, T.tag FROM user U INNER JOIN questions Q ON U.email = Q.email INNER JOIN questionstag QT ON QT.idQuestion = Q.id INNER JOIN tag T ON T.id = QT.idTag WHERE Q.id =?", [id],
                    function(err, rows) {
                        if (err) {
                            connection.release();
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            if (rows.length != 0) {
                                var question = new Object();
                                question.id = rows[0].id;
                                question.title = rows[0].title;
                                question.body = rows[0].body;
                                question.date = new Date(rows[0].date).toDateString();
                                question.name = rows[0].name;
                                question.email = rows[0].email;
                                question.img = rows[0].img;
                                question.tags = [];
                                rows.forEach(row => {
                                    question.tags.push(row.tag);
                                });
                            }
                            connection.release();
                            callback(null, question);
                        }
                    });
            }
        });
    }

    getTags(idQuestion, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("SELECT T.tag FROM tag T INNER JOIN questionstag QT ON QT.idTag = T.id WHERE QT.idQuestion = ?", [idQuestion],
                    function(err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            let tags = [];
                            for (let i = 0; i < rows.length; i++) {
                                tags.push(rows[i]);
                            }
                            callback(null, tags);
                        }
                    });
            }
        });
    }

    insertQuestion(email, title, body, tags, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("INSERT INTO questions (email, title, body) VALUES (?, ?, ?)", [email, title, body],
                    function(err, rows1) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            tags.forEach(tag => {
                                connection.query("SELECT id FROM tag WHERE tag = ?", [tag],
                                    function(err, rows2) {
                                        if (err) {
                                            connection.release(); // devolver al pool la conexión
                                            callback(new Error("Error de acceso a la base de datos"));
                                        } else {
                                            if (rows2.length === 0) {
                                                connection.query("INSERT INTO tag (tag) VALUES (?)", [tag],
                                                    function(err, rows3) {
                                                        if (err) {
                                                            connection.release(); // devolver al pool la conexión
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        } else {
                                                            connection.query("INSERT INTO questionsTag (idQuestion, idTag) VALUES (?, ?)", [rows1.insertId, rows3.insertId],
                                                                function(err) {
                                                                    if (err) {
                                                                        connection.release(); // devolver al pool la conexión
                                                                        callback(new Error("Error de acceso a la base de datos"));
                                                                    }
                                                                });
                                                        }
                                                    });
                                            } else {
                                                console.log(rows2.id);
                                                connection.query("INSERT INTO questionsTag (idQuestion, idTag) VALUES (?, ?)", [rows1.insertId, rows2[0].id],
                                                    function(err) {
                                                        if (err) {
                                                            connection.release(); // devolver al pool la conexión
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        }
                                                    });
                                            }
                                        }
                                    });
                            });
                            callback(null);
                        }
                    });
            }
            connection.release(); // devolver al pool la conexión
        });
    }

    searchQuestionByText(text, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("SELECT U.email, U.name, U.img, Q.id, Q.title, Q.body, Q.date, T.tag FROM user U INNER JOIN questions Q ON U.email = Q.email INNER JOIN questionsTag QT ON QT.idQuestion = Q.id INNER JOIN tag T ON  T.id = QT.idTag WHERE Q.title LIKE '%" + text + "%' OR Q.body LIKE '%" + text + "%' ORDER BY Q.date DESC",
                    function(err, rows) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            var questions = [];
                            if (rows.length != 0) {
                                var count = 0;
                                rows.forEach(function(value, index, array) {
                                    if (index > 0 && array[index - 1].id === value.id) {
                                        count = count + 1;
                                        questions[index - count].tags.push(value.tag);
                                    } else {
                                        var question = new Object();
                                        question.id = value.id;
                                        question.title = value.title;
                                        question.body = value.body;
                                        question.date = new Date(value.date).toDateString();
                                        question.name = value.name;
                                        question.email = value.email;
                                        question.img = value.img;
                                        question.tags = [];
                                        if (value.tag !== null) question.tags.push(value.tag);
                                        questions.push(question);
                                    }
                                });
                            }
                            connection.release(); // devolver al pool la conexión
                            callback(null, questions);
                        }
                    });
            }
        });
    }

    filterQuestionByTag(tag, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("SELECT QT.idQuestion FROM questionstag QT INNER JOIN tag T ON QT.idTag = T.id WHERE T.tag= ? ORDER BY QT.idQuestion DESC", [tag],
                    function(err, rows) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            var questions = [];
                            rows.forEach(function(value) {
                                connection.query("SELECT U.email, U.name, U.img, Q.id, Q.title, Q.body, Q.date, T.tag FROM user U INNER JOIN questions Q ON U.email = Q.email INNER JOIN questionstag QT ON QT.idQuestion = Q.id INNER JOIN tag T ON T.id = QT.idTag WHERE Q.id = ?", [value.idQuestion],
                                    function(err, rows2) {
                                        if (err) {
                                            connection.release(); // devolver al pool la conexión
                                            callback(new Error("Error de acceso a la base de datos"));
                                        } else {
                                            if (rows.length != 0) {
                                                var question = new Object();
                                                question.id = rows2[0].id;
                                                question.title = rows2[0].title;
                                                question.body = rows2[0].body;
                                                question.date = new Date(rows2[0].date).toDateString();
                                                question.name = rows2[0].name;
                                                question.email = rows2[0].email;
                                                question.img = rows2[0].img;
                                                question.tags = [];
                                                rows2.forEach(function(value2) {
                                                    question.tags.push(value2.tag);
                                                });
                                                questions.push(question);
                                            }
                                            if (questions.length == rows.length)
                                                callback(null, questions);
                                        }
                                    });
                                console.log("QUESTIONS:" + questions);
                            });
                            connection.release(); // devolver al pool la conexión
                        }
                    });
            }
        });
    }

    searchWithoutAnswer(callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                connection.query("SELECT U.email, U.name, U.img, Q.id, Q.title, Q.body, Q.date, T.tag FROM user U INNER JOIN questions Q ON U.email = Q.email INNER JOIN questionsTag QT ON QT.idQuestion = Q.id INNER JOIN tag T ON  T.id = QT.idTag WHERE Q.answered = false ORDER BY Q.date DESC",
                    function(err, rows) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            var questions = [];
                            if (rows.length != 0) {
                                var count = 0;
                                rows.forEach(function(value, index, array) {
                                    if (index > 0 && array[index - 1].id === value.id) {
                                        count = count + 1;
                                        questions[index - count].tags.push(value.tag);
                                    } else {
                                        var question = new Object();
                                        question.id = value.id;
                                        question.title = value.title;
                                        question.body = value.body;
                                        question.date = new Date(value.date).toDateString();
                                        question.name = value.name;
                                        question.email = value.email;
                                        question.img = value.img;
                                        question.tags = [];
                                        if (value.tag !== null) question.tags.push(value.tag);
                                        questions.push(question);
                                    }
                                });
                            }
                            connection.release(); // devolver al pool la conexión
                            callback(null, questions);
                        }
                    });
            }
        });
    }

    getAnswers(idQuestion, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {

                connection.query("SELECT U.email, U.name, U.img, A.id, A.body, A.date FROM user U INNER JOIN answer A ON U.email = A.email INNER JOIN questions Q ON Q.id = A.idQuestion WHERE A.idQuestion = ? ORDER BY A.date DESC", [idQuestion],
                    function(err, rows) {
                        if (err) {
                            connection.release();
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            var answers = [];
                            if (rows.length != 0) {
                                rows.forEach(row => {
                                    var answer = new Object();
                                    answer.id = row.id;
                                    answer.body = row.body;
                                    answer.date = new Date(row.date).toDateString();
                                    answer.name = row.name;
                                    answer.email = row.email;
                                    answer.img = row.img;
                                    answers.push(answer);
                                });
                            }
                            connection.release();
                            callback(null, answers);
                        }
                    });
            }
        });
    }

    insertAnswer(idQuestion, email, body, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                console.log(idQuestion, email, body);
                connection.query("INSERT INTO answer (email, body, idQuestion) VALUES (?, ?, ?)", [email, body, idQuestion],
                    function(err, rows) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            connection.query("UPDATE questions SET answered = true WHERE id = ?", [idQuestion],
                                function(err) {
                                    if (err) {
                                        connection.release(); // devolver al pool la conexión
                                        callback(new Error("Error de acceso a la base de datos"));
                                    }
                                });
                            callback(null);
                        }
                    });
            }
            connection.release(); // devolver al pool la conexión
        });
    }
}
module.exports = DAOQuestions;