const inquirer = require('inquirer');
const fs = require('fs');
const { checkVultrApi } = require('./vultr');

function getEnv () {

    if (!fs.existsSync('./config.json')) {
        return false
    }

    let envString = fs.readFileSync('./config.json');
    return JSON.parse(envString);

}

function configure() {

    let questions = [
        {
            type: 'confirm',
            name: 'createConfig',
            message: 'Would you like to configure client?',
            default: false
        },
        {
            when: ({createConfig}) => {
                return createConfig;
            },

            type: 'input',
            name: 'vultrApi',
            message: 'Vultr API key'
        }
    ];

    inquirer.prompt(questions).then((answers) => {
        if (!answers.vultrApi) {
            return;
        }

        console.log('Checking vultr api...');
        modEnv('vultr', answers.vultrApi);
        let env = getEnv();

        checkVultrApi(env).then((res) => {

            console.log('api is ok');

            let configuration = {
                vultr: answers.vultrApi,
                validApi: true

            };

            fs.writeFileSync('./config.json', JSON.stringify(configuration));


        }).catch((e) => {
           console.log(e);
           return false;
        });




    })
}

function modEnv(key, value) {

    let env = getEnv();
    if (env === false) env = {};

    env[key] = value;

    fs.writeFileSync('./config.json', JSON.stringify(env))

}

function delEnv(key) {

    let env = getEnv();
    delete env[key];

    fs.writeFileSync('./config.json', JSON.stringify(env))

}

module.exports = { configure, getEnv, modEnv, delEnv };