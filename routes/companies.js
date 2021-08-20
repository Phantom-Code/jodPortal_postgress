const express = require('express');
const companies = express.Router();
let db = require('../database/db');

// get all companies data also with query name of company and limit
// companies?companyName=value_&limit=value_

companies.get('/', (req, res) => {
    let { companyName, limit } = req.query;
    let query;
    if (limit) {
        limit = parseInt(limit);
        query = `select c.id,c.companyName,c.website,c.userId,u.photo as photo ,count(1) as jobPosted
        from companies c 
        join users u
        on u.id = c.userId
        join jobs j
        on  j.companyId = c.id
        group by c.id ,u.photo
        limit ${limit};`;
    } else {
        query = `select c.id,c.companyName,c.website,c.userId,u.photo as photo ,count(1) as jobPosted
        from companies c 
        join users u
        on u.id = c.userId
        join jobs j
        on  j.companyId = c.id
        group by c.id ,u.photo`;
    }
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        if (companyName) {
            result.rows = result.rows.filter((company) => {
                return company.companyname.toLowerCase().includes(companyName.toLocaleLowerCase());
            });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get company by id
companies.get('/:companyId', (req, res) => {
    let query = `select c.id,c.companyName,c.companyLocation,c.info,c.website,c.userId,u.photo as photo,count(1) as jobPosted
    from companies c 
    join users u
    on u.id = c.userId
    join jobs j
    on  j.companyId = c.id
    where c.id = $1
    group by c.id,j.companyId ,u.photo
    ;`;
    let jobsQuery = 'select id,jobRole,jobType,startDate,endDate,companyId from jobs where companyId =$1 AND endDate >= CURRENT_DATE';
    db.query(query, [req.params.companyId], (err, companies) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        db.query(jobsQuery, [req.params.companyId], (err, jobs) => {
            if (err) {
                console.log(err);
                return res.json({ status: false, message: 'Something went wrong ...' });
            }
            res.json({ status: true, company: companies.rows[0], jobsPosted: jobs.rows });
        });
    });
});
// get company with userId
companies.get('/company/:userId', (req, res) => {
    let query = 'select * from companies where userId=' + req.params.userId;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        if (result.rows.length == 0) {
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows[0] });
    });
});
// add company
companies.post('/', (req, res) => {
    let query = `INSERT INTO companies(
        companyname, website, companylocation, info, userid)
        VALUES ( $1, $2, $3, $4, $5);`;
    db.query(query, Object.values(req.body), (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully added company.' });
    });
});
// update company with id
companies.patch('/:companyId', (req, res) => {
    let query = ['UPDATE companies'];
    query.push('SET');
    let set = [];
    Object.entries(req.body).forEach(([key, value]) => {
        set.push(key + ' = ' + "'" + value + "'");
    });
    query.push(set.join(', '));
    query = query.join(' ') + ' WHERE id=' + req.params.companyId;

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully updated company with id :' + req.params.companyId });
    });
});
// delete company with id
// 1 to 1 relationship also deletes company.userId = companyId
companies.delete('/:companyId', (req, res) => {
    let query = 'delete from users where id=$1';
    db.query(query, [req.params.companyId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully deleted company with id :' + req.params.companyId });
    });
});
module.exports = companies;
