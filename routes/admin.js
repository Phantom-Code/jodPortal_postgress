const express = require('express');
const admin = express.Router();
let db = require('../database/db');
admin.get('/', (req, res) => {
    let query = 'select * from admin';
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get admin by id
admin.get('/:adminId', (req, res) => {
    let query = 'select * from admin where adminId = $1;';
    db.query(query, [req.params.adminId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows[0] });
    });
});
// add admin
admin.post('/', (req, res) => {
    let query = `INSERT INTO admin(email, password, name)
        VALUES ($1, $2, $3) RETURNING adminid`;
    db.query(query, [req.body.email, req.body.password, req.body.name], (err, results) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully added admin.', adminId: results.rows[0].adminid });
    });
});
admin.patch('/:adminId', (req, res) => {
    let query = ['UPDATE admin'];
    query.push('SET');
    let set = [];
    Object.entries(req.body).forEach(([key, i]) => {
        set.push(key + ' = ' + "'" + i + "'");
    });
    query.push(set.join(', '));
    query = query.join(' ') + ' WHERE adminId=' + req.params.adminId;
    db.query(query, (err, result) => {
        if (err) return res.json({ status: false, message: 'Something went wrong ...' });
        res.json({ status: true, message: 'Successfully updated user with id :' + req.params.adminId });
    });
});
admin.post('/login', (req, res) => {
    let query = 'select * from admin where email= $1';
    db.query(query, [req.body.email], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        } else if (result.rows.length == 0) {
            return res.json({ status: false, message: 'User not found' });
        } else {
            res.json({ status: true, data: result.rows[0] });
        }
    });
});
module.exports = admin;
