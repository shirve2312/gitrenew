let devSetting = function () { };

// AWS
devSetting.credentials = {
    accessHost: process.env.PlanitnerdAccessHost,
    AwsAccessKey: process.env.AwsAccessKey,
    AwsSecretAccessKey: process.env.AwsSecretAccessKey,
    AwsRegion: process.env.AwsRegion
};

devSetting.AWS_CONFIG_S3 = {
    accessKeyId: process.env.AwsAccessKey,
    secretAccessKey: process.env.AwsSecretAccessKey,
    Bucket: process.env.BUCKET_NAME
};

devSetting.AWS_FROM = process.env.AWS_FROM;

devSetting.AWS_BUCKET = process.env.BUCKET_NAME;

devSetting.expireTokenIn = 60 * 30; //token will expire after half n hour
devSetting.SECRET = process.env.SECRET;

devSetting.SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY;

module.exports = devSetting;
