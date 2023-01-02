var express = require('express');
var path = require('path');
const config = require("../config");
var router = express.Router();
const mysql = require("mysql");
const pool = mysql.createPool(config);
var daoUsers = require("../dao/DAOUsers");
const daoU = new daoUsers(pool);
const multer = require("multer");
var storage = multer.memoryStorage()
var multerFactory = multer({ storage: storage })
const fs = require('fs');
const { request } = require('express');


const logged = function(req, res, next) {
    console.log("Entra en logged");
    if (!req.session.currentUser) {
        res.redirect("/users/login");
    } else {
        next();
    }
}

router.get('/', logged, function(req, res) {
    res.status(200);
    res.renegadfder("index", { email: req.session.currentUser, name: req.session.name });
});

router.get('/login', function(req, res) {
    if(req.session.currentUser)req.session.destroy();
    res.status(200);
    res.render("login", { title: "login" });
});

router.get('/register', function(req, res) {
    if(req.session.currentUser)req.session.destroy();
    res.status(200);
    res.render("register", { title: "register" });
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.status(200);
    res.render("login", { title: "logout" });
});

router.get('/image/:email', logged, function(request, response) {
    console.log("entra en image del router");
    daoU.getUserImage(request.params.email, cb_img);

    function cb_img(err, img) {
        if (err) {
            next(err);
        } else {
            console.log(img);
            response.end(img);
        }
    }
});


router.post("/login", function(request, response, next) {
    daoU.loginUser(request.body.email, request.body.password, cb_login);

    function cb_login(err, rows) {
        if (err) {
            next(err);
        } else {
            if (!rows) {
                response.status(200);
                response.render("login", { errorMsg: "Email y/o contraseña no válidos" });
            } else {

                response.status(200);
                request.session.currentUser = request.body.email;
                response.locals.userEmail = request.body.email;
                request.session.userImg = rows[0].img;
                response.locals.userImg = rows[0].img;
                request.session.name = rows[0].name;
                response.locals.name = rows[0].name;
                console.log("IMAGEN" + rows[0].img);

                response.render("index", { errorMsg: null, userName: response.locals.name, email: response.locals.userEmail });

            }
        }
    }

});

router.post("/register", multerFactory.single('image'), function(request, response, next) {

    daoU.existingUser(request.body.email, cb_ex);

    function cb_ex(err, rows) {
        if (err) {
            next(err);
        } else {
            if (rows) {
                response.status(200);
                response.render("register", { errorMsg: "El usuario ya existe" });
            } else {
                if (request.body.password !== request.body.confirmPassword) {
                    response.status(200);
                    response.render("register", { errorMsg: "La confirmación de la contraseña no coincide" });
                    
                }else if(request.body.password === request.body.password.toLowerCase()
                        || request.body.password === request.body.password.toUpperCase()
                        || /\d/.test(!request.body.password)){
                    response.status(200);
                    response.render("register", { errorMsg: "La contraseña debe contener: mínusculas, mayúsculas y números" });
                }else {
                    let img = null;
                    console.log(request.file);
                    if (request.file) {
                        img = request.file.buffer;
                    } else {
                        num = Math.floor(Math.random() * (4 - 1)) + 1;
                        console.log(num);
                        switch (num) {
                            case 1:
                                img = fs.readFileSync("public/images/defecto1.png");
                                break;
                            case 2:
                                img = fs.readFileSync("public/images/defecto2.png");
                                break;
                            case 3:
                                img = fs.readFileSync("public/images/defecto3.png");
                                break;
                        }
                    }

                    daoU.createUser(request.body.email, request.body.password, request.body.name, img, cb_login);
                    //daoU.createUser(request.body.email, request.body.password, request.body.name, "img", cb_login);
                    function cb_login(err, rows) {
                        if (err) {
                            next(err);
                        } else {
                            response.status(200);
                            request.session.currentUser = request.body.email;
                            response.locals.userEmail = request.body.email;
                            request.session.userImg = img;
                            response.locals.userImg = img;
                            request.session.name = request.body.name;
                            response.locals.name = request.body.name;

                            console.log(response.locals.userImg);
                            response.render("index", { msg: null, userName: response.locals.name, email: response.locals.userEmail });
                        }
                    }
                }
            }
        }

    }
});


module.exports = { router, logged };