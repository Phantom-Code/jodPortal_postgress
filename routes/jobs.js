const express = require('express');
const jobs = express.Router();
let db = require('../database/db');
// get all jobs
jobs.get('/', (req, res) => {
    let { category, limit } = req.query;
    let query;
    if (limit) {
        query = `SELECT j.id,j.jobRole,j.category,j.jobType,j.jobLocation,j.startDate,j.tags,c.companyName,u.photo 
        FROM jobs as j
        JOIN companies as c
        ON j.companyId = c.id
        JOIN users as u 
        ON  c.userId = u.id
        WHERE j.endDate >= CURRENT_DATE
        LIMIT ${limit}`;
    } else {
        query = `SELECT j.id,j.jobRole,j.category,j.jobType,j.jobLocation,j.startDate,j.tags,c.companyName,u.photo 
        FROM jobs as j
        JOIN companies as c
        ON j.companyId = c.id
        JOIN users as u 
        ON  c.userId = u.id 
        WHERE j.endDate >= CURRENT_DATE`;
    }
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        if (category) {
            result.rows = result.rows.filter((job) => job.category == category);
        }
        res.json({ status: true, data: result.rows });
    });
});
//get jobs by companyId
jobs.get('/company/:companyId', (req, res) => {
    let query = 'select id,jobRole,jobLocation,startDate from jobs where companyId=$1';
    db.query(query, [req.params.companyId], (err, results) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: results.rows });
    });
});
// get job by id
jobs.get('/:jobId', (req, res) => {
    let query = `SELECT j.id,j.jobRole,j.category,j.jobType,j.startDate,j.endDate,j.jobLocation,j.roleOverview,j.workingFormat,j.keyPoints,j.tags,c.website,u.photo,c.info
    FROM jobs j
    JOIN companies as c
    ON j.companyId = c.id
    JOIN users as u 
    ON  c.userId = u.id WHERE j.id = $1;`;
    db.query(query, [req.params.jobId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows });
    });
});
// add job
jobs.post('/', (req, res) => {
    let query = `INSERT INTO jobs(
        jobrole, category, jobtype, joblocation, startdate, enddate, roleoverview, workingformat, keypoints, tags, companyid)
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;

    db.query(query, Object.values(req.body), (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully added job.' });
    });
});
// update job with id
jobs.patch('/:jobId', (req, res) => {
    let query = ['UPDATE jobs'];
    query.push('SET');
    let set = [];
    Object.entries(req.body).forEach(([key, value]) => {
        set.push(key + ' = ' + "'" + value + "'");
    });
    query.push(set.join(', '));
    query = query.join(' ') + ' WHERE id=' + req.params.jobId;

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully updated job with id :' + req.params.jobId });
    });
});
// delete job wit id
jobs.delete('/:jobId', (req, res) => {
    let query = 'delete from jobs where id=$1';
    db.query(query, [req.params.jobId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully deleted job with id :' + req.params.jobId });
    });
});
module.exports = jobs;
