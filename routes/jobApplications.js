const express = require('express');
const jobApplication = express.Router();
let db = require('../database/db');
//
jobApplication.get('/', (req, res) => {
    let { userId } = req.query;
    let query = `SELECT a.id,a.userID,a.jobID,j.jobRole,j.jobType,j.jobLocation,j.tags,j.startDate,j.companyId,
    u.photo,u.full_name as companyName,applicants.full_name,applicants.email,applicants.photo as userPhoto
    FROM jobApplication as a
    JOIN jobs as j
    ON a.jobID = j.id 
    JOIN users applicants
    ON a.userID = applicants.id
    JOIN companies c
    ON c.id=j.companyId
    JOIN users as u
    ON c.userId = u.id;`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        if (userId) {
            result.rows = result.rows.filter((jobApplication) => {
                return jobApplication.userid == userId;
            });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get Applications by companyId
jobApplication.get('/company/:userId', (req, res) => {
    let query = `SELECT a.id,a.userID,a.jobID,j.jobRole,j.jobType,j.jobLocation,j.tags,j.startDate,j.companyId,
    u.photo,u.full_name as companyName,applicants.full_name,applicants.email,applicants.photo as userPhoto
    FROM jobApplication as a
                JOIN jobs as j
                ON a.jobID = j.id 
                JOIN users applicants
                ON a.userID = applicants.id
                JOIN companies c
                ON c.id=j.companyId
                JOIN users as u
                ON c.userId = u.id
                where c.userId  = ${req.params.userId}`;
    db.query(query, (err, result) => {
        if (err) {
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get jobApplication by id
jobApplication.get('/:jobApplicationId', (req, res) => {
    let query = 'select * from jobApplication where id = $1;';
    db.query(query, [req.params.jobApplicationId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows[0] });
    });
});
// add jobApplication
jobApplication.post('/', (req, res) => {
    let query1 = 'select * from jobApplication where jobID=$1 AND userID=$2';
    let query = 'insert into jobApplication (userId,jobId) VALUES($1,$2)';
    db.query(query1, [req.body.jobID, req.body.userID], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        if (result.rows.length == 0) {
            db.query(query, [parseInt(req.body.userID), parseInt(req.body.jobID)], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.json({ status: false, message: 'Something went wrong ...' });
                }
                res.json({ status: true, message: 'Successfully added jobApplication.' });
            });
        } else {
            res.json({ status: false, message: 'Already applied for this job .' });
        }
    });
});
// update jobApplication with id
jobApplication.patch('/:jobApplicationId', (req, res) => {
    let query = ['UPDATE jobApplication'];
    query.push('SET');
    let set = [];
    Object.entries(req.body).forEach(([key, value]) => {
        set.push(key + ' = ' + "'" + value + "'");
    });
    query.push(set.join(', '));
    query = query.join(' ') + ' WHERE id=' + req.params.jobApplicationId;

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully updated jobApplication with id :' + req.params.jobApplicationId });
    });
});
// delete jobApplication with id
jobApplication.delete('/:jobApplicationId', (req, res) => {
    let query = 'delete from jobApplication where id=$1';
    db.query(query, [req.params.jobApplicationId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully deleted jobApplication with id :' + req.params.jobApplicationId });
    });
});
module.exports = jobApplication;
