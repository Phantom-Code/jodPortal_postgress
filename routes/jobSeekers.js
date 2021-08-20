const express = require('express');
const path = require('path');
const multer = require('multer');
const jobSeekers = express.Router();
let db = require('../database/db');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_';
        cb(null, file.fieldname + '_' + uniqueSuffix + path.basename(file.originalname, path.extname(file.originalname)) + path.extname(file.originalname));
    },
});
let upload = multer({ storage: storage });
var cpUpload = upload.fields([
    { name: 'userImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]);
// get all jobSeekers data also with limit
// default limit is 10
jobSeekers.get('/', (req, res) => {
    let { limit } = req.query;
    limit = !limit ? 10 : parseInt(limit);
    let query = 'select * from jobSeekers limit $1;';
    db.query(query, [limit], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows });
    });
});
// get jobSeeker by id
jobSeekers.get('/:jobSeekerId', (req, res) => {
    let query = 'select * from jobSeekers j join users u on j.userId=u.id where u.id = $1;';
    db.query(query, [req.params.jobSeekerId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, data: result.rows[0] });
    });
});
// add jobSeeker
jobSeekers.post('/', cpUpload, (req, res) => {
    let data = [
        '/uploads/' + req.files['userImage'][0].filename,
        req.body.location,
        req.body.role,
        req.body.exp,
        req.body.bio,
        req.body.skills,
        '/uploads/' + req.files['resume'][0].filename,
        req.body.highestQualification,
        req.body.phoneNumber,
        req.body.website,
        req.body.userId,
    ];
    let query = `INSERT INTO jobseekers(photo, address, userrole, experience, bio, skills, userresume, highestqualifiaction, phone, website, userid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;
    db.query(query, data, (err, results, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully added jobSeeker.', results: results });
    });
});
// update jobSeeker with id
jobSeekers.patch('/:jobSeekerId', cpUpload, (req, res) => {
    let query, data;
    if (req.files['userImage'] == undefined || req.files['resume'] == undefined) {
        data = [req.body.address, req.body.userRole, req.body.experience, req.body.bio, req.body.skills, req.params.jobSeekerId];
        query = `UPDATE jobseekers
	            SET address=$1, userrole=$2, experience=$3, bio=$4, skills=$5
	            WHERE id=$6;`;
    } else {
        data = [
            '/uploads/' + req.files['userImage'][0].filename,
            req.body.address,
            req.body.userRole,
            req.body.experience,
            req.body.bio,
            req.body.skills,
            '/uploads/' + req.files['resume'][0].filename,
            req.params.jobSeekerId,
        ];
        query = `UPDATE jobseekers
	            SET  photo=$1, address=$2, userrole=$3, experience=$4, bio=$5, skills=$6, userresume=$7
	            WHERE id=$8;`;
    }
    db.query(query, data, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully updated jobSeeker with id :' + req.params.jobSeekerId });
    });
});
// delete jobSeeker with id
jobSeekers.delete('/:jobSeekerId', (req, res) => {
    let query = 'delete from jobSeekers where id=$1';
    db.query(query, [req.params.jobSeekerId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: false, message: 'Something went wrong ...' });
        }
        res.json({ status: true, message: 'Successfully deleted jobSeeker with id :' + req.params.jobSeekerId });
    });
});
module.exports = jobSeekers;
