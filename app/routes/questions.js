var express = require('express');
const config = require("../config");
var router = express.Router();
const mysql = require("mysql");
const pool = mysql.createPool(config);
var daoQuestions = require("../dao/DAOQuestions");
const { request, response } = require('express');
const { render } = require('ejs');
const daoQ = new daoQuestions(pool);
const routerUser = require("./users");


router.get('/',routerUser.logged, function(req, res, next) {

    daoQ.getQuestions(cb_questions);

    function cb_questions(err, rows) {
        if (err) {
            next(err);
        } else {
            res.status(200);
            res.render("questions", { name: req.session.name, quests: rows, email: req.session.currentUser });
        }
    }
});

router.get('/formulate', routerUser.logged, function(req, res, next) {

    res.status(200);
    res.render("formulate", { name: req.session.name, email: req.session.currentUser });
});

router.post('/formulate', routerUser.logged, function(req, response, next) {

    let tags = req.body.tags.split('@');
    tags.shift();

    if(tags.length > 5){
        response.render("formulate", {errorMsg: "El número máximo de tags es 5", name: req.session.name, email: req.session.currentUser});s
    }
    else{
        daoQ.insertQuestion(req.session.currentUser, req.body.title, req.body.body, tags, cb_formulate);

        function cb_formulate(err, row) {
            if (err) {
                next(err);
            } else {
                daoQ.getQuestions(cb_questions);

                function cb_questions(err, rows) {
                    if (err) {
                        next(err);
                    } else {
                        response.status(200);
                        response.render("questions", { quests: rows, name: req.session.name, email: req.session.currentUser });
                    }
                }
            }
        }
    }
});

router.post('/searchfilter', routerUser.logged, function(req, res, next) {
    daoQ.searchQuestionByText(req.body.searchText, cb_questionText);

    function cb_questionText(err, rows) {
        if (err) {
            next(err);
        } else {
            res.status(200);
            res.render("searchfilter", { quests: rows, text: req.body.searchText, name: req.session.name, email: req.session.currentUser });
        }
    }
});

router.get('/filterByTag/:tag', routerUser.logged, function(req, res, next) {
   
    daoQ.filterQuestionByTag(req.params.tag, cb_questionsTag);

    function cb_questionsTag(err, rows) {
        if (err) {
            next(err);
        } else {
            res.status(200);
            res.render("tagfilter", { quests: rows, tag: req.params.tag, name: req.session.name, email: req.session.currentUser });
        }
    }
    
});

router.get('/answers/:idQuestion',routerUser.logged, function(req, res, next) {
    
    daoQ.getQuestion(req.params.idQuestion, cb_question);

    function cb_question(err, rows) {
        if (err) {
            next(err);
        } else {
            daoQ.getAnswers(req.params.idQuestion, cb_answers);

            function cb_answers(err2, rows2) {
                if (err2) {
                    next(err2);
                } else {
                    res.status(200);
                    res.render("answers", { question: rows, answ: rows2, email: req.session.currentUser, name: req.session.name });
                }
            }
        }
    } 
});

router.post('/answer/:idQuestion',routerUser.logged, function(req, response, next) {
    daoQ.insertAnswer(req.params.idQuestion, req.session.currentUser, req.body.body, cb_answer);

    function cb_answer(err, row) {
        if (err) {
            next(err);
        } else {
            daoQ.getQuestions(cb_questions);

            function cb_questions(err, rows) {
                if (err) {
                    next(err);
                } else {
                    response.status(200);
                    response.render("questions", { quests: rows, name: req.session.name, email: req.session.currentUser });
                }
            }
        }
    }
});

router.get('/notAnswered',routerUser.logged, function(req, res, next) {
    daoQ.searchWithoutAnswer(cb_withoutAnswer);

    function cb_withoutAnswer(err, rows) {
        if (err) {
            next(err);
        } else {
            res.status(200);
            res.render("notAnswered", { quests: rows, name: req.session.name, email: req.session.currentUser });
        }
    } 
});



module.exports = router;