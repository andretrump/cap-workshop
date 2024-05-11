const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");

const VCAP_SERVICES_PATTERN = /VCAP_SERVICES: ([\s\S]*)VCAP_APPLICATION/g;
const VCAP_APPLICATION_PATTERN = /VCAP_APPLICATION: ([\s\S]*)User-Provided:/g;

async function initEnv(applicationName, targetFolder) {
    let { error, stdout, stderr } = await exec(`cf env ${applicationName}`);
    if (error) {
        console.error(`Failed to get app environement variables: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`Failed to get app environement variables: ${stderr}`);
        return;
    }
    const vcapServicesString = [...stdout.matchAll(VCAP_SERVICES_PATTERN)][0][1];
    const vcapServices = JSON.parse(vcapServicesString);

    const vcapApplicationString = [...stdout.matchAll(VCAP_APPLICATION_PATTERN)][0][1];
    const vcapApplication = JSON.parse(vcapApplicationString.slice(0, -5));

    let envContent = `auth-url=${vcapServices.xsuaa[0].credentials.url}\nclient-id=${vcapServices.xsuaa[0].credentials.clientid}\nclient-secret=${vcapServices.xsuaa[0].credentials.clientsecret}\nsrv-url=https://${vcapApplication.application_uris[0]}`;

    const targetFile = path.resolve(targetFolder, ".env")
    fs.writeFileSync(targetFile, envContent);
    console.log(`Wrote environment to ${targetFile}.`);
}

const usage = "Usage:\ninit-env.js [Application name] [Target folder]"

const applicationName = process.argv[2];
const targetFolder = process.argv[3];

if (!applicationName || !targetFolder) {
    console.error(`Invalid arguments.\n\n${usage}`);
    return;
}

const targetFolderExists = fs.existsSync(targetFolder) && fs.lstatSync(targetFolder).isDirectory();
if (!targetFolderExists) {
    console.error("The provided target directory does not exist.");
    return;
}

initEnv(applicationName, targetFolder);