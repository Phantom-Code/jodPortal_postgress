const express = require('express');
const newsletterSubscriptions = express.Router();
let db = require('../database/db');

newsletterSubscriptions.get('/', (req, res) => {
    let { limit } = req.query;
    let query;
    if (limit) {
        limit = parseInt(limit);
        query = 'select * from newsletterSubscriptions order by appliedOn desc limit $1;';
    } else {
        query = 'select * from newsletterSubscriptions order by appliedOn desc ';
    }
    db.query(query, [limit], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get subscription by id
newsletterSubscriptions.get('/:subscriptionId', (req, res) => {
    let query = 'select * from newsletterSubscriptions where subscriptionId = $1;';
    db.query(query, [req.params.subscriptionId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows[0] });
    });
});
// add subscription
newsletterSubscriptions.post('/', (req, res) => {
    let query = `INSERT INTO newslettersubscriptions(email)
        VALUES ($1);`;
    db.query(query, Object.values(req.body), (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully added subscription.' });
    });
});
// update subscription with id
newsletterSubscriptions.patch('/:subscriptionId', (req, res) => {
    let query = ['UPDATE newsletterSubscriptions'];
    query.push('SET');
    let set = [];
    Object.entries(req.body).forEach(([key, value]) => {
        set.push(key + ' = ' + "'" + value + "'");
    });
    query.push(set.join(', '));
    query = query.join(' ') + ' WHERE subscriptionId=' + req.params.subscriptionId;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully updated subscription with subscriptionId :' + req.params.subscriptionId });
    });
});
// delete job wit subscriptionId
newsletterSubscriptions.delete('/:subscriptionId', (req, res) => {
    let query = 'delete from newsletterSubscriptions where subscriptionId=$1';
    db.query(query, [req.params.subscriptionId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully deleted subscription with subscriptionId :' + req.params.subscriptionId });
    });
});
module.exports = newsletterSubscriptions;
