var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MYSQLStore = mysqlSession(session);
const config = require("./config");
const sessionStore = new MYSQLStore({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

var questionsRouter = require('./routes/questions');
var usersRouter = require('./routes/users');
//var answersRouter = require('./routes/answers');
//const { ppid, config } = require('process');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(middlewareSession);

app.get("/reset", function(request, response) {
    this.response.status(200);
    this.request.session.contador = 0;
    this.response.type("text/plain");
    this.response.end("Has reiniciado el contador");
});

app.get("/increment", function(request, response) {
    if (request.session.contador == undefined) {
        response.redirect("/reset");
    } else {
        let contador = Number(request.session.contador) + 1;
        request.session.contador++;
        response.status(200);
        response.type("text/plain");
        response.end("El valor actual del contador es ${contador}");
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/index", usersRouter.router);
app.use("/", usersRouter.router);
app.use('/questions', questionsRouter);
app.use('/users', usersRouter.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// ERRORS
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;