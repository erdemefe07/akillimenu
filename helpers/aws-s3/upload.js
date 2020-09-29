const AWS = require('aws-sdk');
const mongoose = require('mongoose')
const BUCKET_NAME = 'akillimenum';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});

module.exports = (buffer, id = String(new mongoose.Types.ObjectId())) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: id, // File name you want to save as in S3
        Body: buffer,
        ContentType: 'image',
        ACL: 'public-read',
    };

    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
    });
    return id;
};