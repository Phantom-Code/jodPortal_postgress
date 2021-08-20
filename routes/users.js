const express = require('express');
const path = require('path');
const multer = require('multer');
const users = express.Router();
let db = require('../database/db');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_';
        cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname));
    },
});
let upload = multer({ storage: storage });

users.get('/', (req, res) => {
    let query = 'select * from users';
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get user by id
users.get('/:userId', (req, res) => {
    let query = 'select * from users where id = $1;';
    db.query(query, [req.params.userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows[0] });
    });
});
// add user
users.post('/', upload.single('photo'), (req, res) => {
    let data;
    let query;
    if (req.file == undefined) {
        data = [req.body.full_name, req.body.email, req.body.userPassword, req.body.isJobProvider];
        query = `INSERT INTO users(full_name, email, userpassword, isjobprovider)
            VALUES ( $1, $2, $3, $4) RETURNING id;`;
    } else {
        query = `INSERT INTO users(full_name, photo, email, userpassword, isjobprovider)
            VALUES ( $1, $2, $3, $4, $5) RETURNING id`;
        data = [req.body.full_name, '/uploads/' + req.file.filename, req.body.email, req.body.userPassword, req.body.isJobProvider];
    }
    db.query(query, data, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully added user.', userId: result.rows[0].id });
    });
});
// update user with id
users.patch('/:userId', upload.single('photo'), (req, res) => {
    let data;
    if (req.file) {
        data = Object.assign(req.body, {
            photo: '/uploads/' + req.file.filename,
        });
    } else {
        data = req.body;
    }
    let query = ['UPDATE users'];
    query.push('SET');
    let set = [];
    Object.entries(req.body).forEach(([key, value]) => {
        set.push(key + ' = ' + "'" + value + "'");
    });
    query.push(set.join(', '));
    query = query.join(' ') + ' WHERE id=' + req.params.userId;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully updated user with id :' + req.params.userId });
    });
});
// delete job with id
users.delete('/:userId', (req, res) => {
    let query = 'delete from users where id=$1';
    db.query(query, [req.params.userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully deleted user with id :' + req.params.userId });
    });
});
users.post('/login', (req, res) => {
    let query = 'select * from users where email= $1';
    db.query(query, [req.body.email], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        } else if (result.length == 0) res.json({ status: false, message: "Couldn't find user" });
        else res.json({ status: true, data: result.rows[0] });
    });
});
module.exports = users;
