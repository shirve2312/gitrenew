const logger = require("./logger");
const AWS = require("aws-sdk");
const uuid = require("node-uuid");
const Q = require("q");
let async = require("async");
const fs = require("fs");
const path = require("path");
const utilsfunction = require("./utils");
const _ = require("lodash");
const config = require("../config/config");
const credentials = config.credentials;

AWS.config.update({
    accessKeyId: credentials.AwsAccessKey,
    secretAccessKey: credentials.AwsSecretAccessKey,
    region: credentials.AwsRegion
});

const endpoint = new AWS.Endpoint(credentials.accessHost);
const awsUtils = {};
const SES_CONFIG = _.extend(AWS, { apiVersion: process.env.AWS_API_VERSION });
const ses = new AWS.SES(SES_CONFIG);

const S3 = new AWS.S3({ endpoint: endpoint, signatureVersion: "v2" });

const sns = new AWS.SNS({
    region: process.env.SnsAwsRegion
});

awsUtils.getS3 = () => {
    return s3;
};

awsUtils.getPreSignedURL = prefix => {
    const s3ObjectKey = `${ prefix }/${ uuid.v1() }`;
    const deferred = Q.defer();

    s3.getSignedUrl(
        "putObject",
        {
            Bucket: process.env.AwsS3Bucket,
            Expires: parseInt(process.env.PreSignedUrlExpiration, 10),
            Key: s3ObjectKey,
            ACL: "public-read"
        },
        (err, url) => {
            if (err == null) {
                deferred.resolve({
                    preSignedUrl: url,
                    key: s3ObjectKey,
                    url: awsUtils.getS3Url(s3ObjectKey)
                });
            } else {
                logger.error(err);
            }
        }
    );

    return deferred.promise;
};

awsUtils.getS3Url = key => {
    return `https://${ process.env.AwsS3Bucket }.s3.amazonaws.com/${ key }`;
};

awsUtils.getCFUrl = key => {
    return `https://${ process.env.AwsCloudFront }/${ key }`;
};

awsUtils.publishSnsSMS = (to, message) => {
    const deferred = Q.defer();
    const params = {
        Message: message,
        PhoneNumber: to,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': 'Planitnerd'
            }
        }
    };

    const paramsAtt = {
        attributes: {
            /* required */
            DefaultSMSType: "Transactional",
            DefaultSenderID: "UTIL"
        }
    };

    sns.setSMSAttributes(paramsAtt, (err, data) => {
        if (err) {
            logger.error(err, err.stack);
        } else {
            logger.info(data);
            sns.publish(params, (snsErr, snsData) => {
                if (snsErr) {
                    // an error occurred
                    logger.error(snsErr);
                    deferred.reject(snsErr);
                } else {
                    // successful response
                    // logger.info(data);
                    console.log({ MessageID: snsData.MessageId });
                    deferred.resolve(snsData);
                }
            });
        }
    });

    return deferred.promise;

};

awsUtils.putObject = (file, key, encoding) => {
    return new Promise((resolve, reject) => {
        const params = {
            Body: file.body,
            Bucket: process.env.AwsS3Bucket,
            Key: key,
            ACL: "public-read",
            ContentType: file.mime,
            ContentDisposition: "inline",
            ContentEncoding: encoding
        };

        s3.putObject(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                logger.info(data);
                resolve({
                    key,
                    url: awsUtils.getCFUrl(key)
                });
            }
        });
    });
    // });
};

awsUtils.uploadFolder = (folder, files, videoType) => {
    const vType = videoType || "story";
    return new Promise((resolve, reject) => {
        const distFolderPath = `${ vType }/${ uuid.v1() }`;

        const promises = [];

        // Can use `forEach`, but used `every` as hack to break the loop
        files.every(file => {
            // get the full path of the file
            const key = path.join(distFolderPath, path.basename(file.path));

            promises.push(awsUtils.putObject(file, key));
            return true;
        });

        Q.allSettled(promises).then(results => {
            const s3Files = [];
            results.forEach(result => {
                if (result.state === "fulfilled") {
                    s3Files.push(result.value);
                } else {
                    reject(result.reason);
                }
            });
            resolve(s3Files);
        });
    });
    // });
};

awsUtils.downloadObject = key => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.AwsS3BucketLiveStream,
            Key: key
        };

        const filePath = `/tmp/${ path.basename(key) }`;
        logger.info("Started");
        s3.getObject(params, (err, data) => {
            if (err) {
                return reject(err);
            }

            fs.writeFile(filePath, data.Body, errFile => {
                if (errFile) {
                    return reject(errFile);
                }
                logger.info("The file has been saved!", filePath);
                resolve({ path: filePath, type: data.ContentType });
            });
        });
    });
};

awsUtils.uploadFile = (file, referenceId, newFilename, storagePath, cb) => {
    let files = file;
    let currentFile = awsUtils;
    let response = { data: [], error: "" };
    let fileData = [];

    let configS3 = config.AWS_CONFIG_S3;
    configS3 = _.extend(configS3, { apiVersion: "2010-12-01" });
    let S3 = new AWS.S3(configS3);

    let oldFilename = file.path;
    let fileName = file.name;
    let extension = path.extname(fileName);
    let baseFileName = path.basename(fileName, extension);
    let newPath = storagePath + newFilename;
    let data = fs.readFileSync(oldFilename);

    fileData.push({
        data: data,
        type: file.type,
        name: newFilename,
        path: newPath
    });
    if (fileData.length > 0) {
        async.eachSeries(
            fileData,
            (file, callback) => {
                let params = {
                    Bucket: process.env.BUCKET_NAME,
                    ACL: "public-read",
                    Body: file.data,
                    Key: file.path,
                    ContentType: file.type
                };
                S3.putObject(params, (err, res) => {
                    if (utilsfunction.isDefined(err)) {
                        response.error = err;
                        console.log("file upload:" + err);
                    }
                    response.data.push(file.name);
                    cb(response);
                });
            },
            err => {
                console.log("series", err, response);
                cb(response);
            }
        );
    } else {
        console.log("error: no file");
        cb(response);
    }
};

awsUtils.deleteFile = (oldData, storagePath) => {
    let configS3 = config.AWS_CONFIG_S3;
    configS3 = _.extend(configS3, { apiVersion: "2010-12-01" });
    let S3 = new AWS.S3(configS3);

    let params = {
        Bucket: process.env.BUCKET_NAME
    };
    params.Key = storagePath + oldData;
    S3.deleteObject(params, function (err, data) {
        if (err) {
            console.log("AWS response ", err);
        }
    });
};

module.exports = awsUtils;
