/* eslint-disable no-console, no-undef */

const s3 = require("s3");
const fs = require("fs");
const path = require("path");
const prompt = require('prompt');

console.log("Uploader starting.");


// ----------------------------------------------------------------------------------------------------------------
// 1. Parse command-line arguments
// ----------------------------------------------------------------------------------------------------------------

/*
--config <filename>: define the config that should be used. Default is "uploader.config.json" relative to the uploader script.
Example config file:
{
	"SP_AWS_KEY_ID": "access",
	"SP_AWS_SECRET": "secret",
	"SP_ROOT_DIR": "./../dist"
}
*/

let configLocation = path.join(__dirname, "uploader.config.json");
let isProd = false;

for (let i = 2; i < process.argv.length; i++) {
	if (process.argv[i] == "--config" && i < process.argv.length + 1) {
		configLocation = process.argv[i + 1];
		i++;
	}
  if (process.argv[i] == '--production') {
    isProd = true;
  }
}

console.log(`Using config file: ${configLocation}`);


// ----------------------------------------------------------------------------------------------------------------
// 2. Try to read deploy settings from environment variables and config file
// ----------------------------------------------------------------------------------------------------------------

let configFile = null;
try {
	configFile = JSON.parse(fs.readFileSync(configLocation, "utf8"));
} catch (e) {
	// No config, just proceed silently
}

const accessKeyId = process.env.SP_AWS_KEY_ID || (configFile ? configFile.SP_AWS_KEY_ID : undefined);
const secretAccessKey = process.env.SP_AWS_SECRET || (configFile ? configFile.SP_AWS_SECRET : undefined);
const rootDir = process.env.SP_ROOT_DIR || (configFile ? configFile.SP_ROOT_DIR : undefined);

let isError = false;

if (!accessKeyId) {
	console.error("Error: no access key id found!");
	console.error("Please set SP_AWS_KEY_ID as a process.env variable, or as a key/value pair inside a uploader.config.json file.");
	isError = true;
}
if (!secretAccessKey) {
	console.error("Error: no secret access key found!");
	console.error("Please set SP_AWS_SECRET as a process.env variable, or as a key/value pair inside a uploader.config.json file.");
	isError = true;
}
if (!rootDir) {
	console.error("Error: no root dir path found!");
	console.error("Please set SP_ROOT_DIR as a process.env variable, or as a key/value pair inside a uploader.config.json file.");
	isError = true;
}

if (isError) {
	process.exit();
}


// ----------------------------------------------------------------------------------------------------------------
// 3. If all is good, continue with the upload
// ----------------------------------------------------------------------------------------------------------------

const spDir = path.join(__dirname, rootDir);

console.log("Using configuration:");
console.log("  SP_AWS_KEY_ID: " + accessKeyId.replace(/./g, "*"));
console.log("  SP_AWS_SECRET: " + secretAccessKey.replace(/./g, "*"));
console.log(`  SP_ROOT_DIR: "${rootDir}", evaluated as "${spDir}"`);

const client = s3.createClient({
	s3Options: {
		accessKeyId: accessKeyId,
		secretAccessKey: secretAccessKey,
	},
});

const params = {
	localDir: spDir,
	deleteRemoved: true,
	s3Params: {
		Bucket: "aws-website-sp-staging-ll2s9",
	},
};

if (isProd) {
  prompt.start();
  prompt.get({
    properties: {
      confirm: {
        pattern: /^(yes|no|y|n)$/gi,
        description: 'Do you really want to push to PROD?',
        message: 'yes/no',
        required: true,
        default: 'no'
      }
    }
  }, function(err, result) {
    const answer = result.confirm.toLowerCase();
    console.log(answer);
    if (answer === 'y' || answer === 'yes') {
      console.log('Setting bucket to PROD');
      params.s3Params.Bucket = 'aws-website-sp-prod';
      performUpload();
    } else if (answer !== 'y' || answer !== 'yes') {
      console.log('Aborting PROD push');
      process.exit();
  }
  });
} else {
  performUpload();
}

function performUpload() {
  const uploader = client.uploadDir(params);
  uploader.on("error", function(err) {
    console.error("Error: Unable to sync:", err.stack);
  });
  uploader.on("progress", function() {
    console.log(`Uploading: ${calculatePercentage(uploader.progressAmount, uploader.progressTotal)}%`);
  });
  uploader.on("end", function() {
    console.log("Done uploading.");
  });
}

function calculatePercentage(numerator, denominator) {
	return numerator / Math.max(denominator, 1) * 100;
}
