const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});

module.exports = (imageName) => {
    console.log("imageName", imageName)
    const images = {
        Bucket: 'akillimenum-images',
        Delete: {
            Objects: [
                { Key: imageName + '.jpg', },
                { Key: imageName + '.webp', }
            ],
            Quiet: true
        },
    };

    s3.deleteObjects(images, function (err, data) {
        console.log("data", data)
        console.log("err", err)
    });
};