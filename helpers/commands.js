const vultr = require('./vultr');
const configuration = require('./configuration');
const inquirer = require('inquirer');

function displayInstances() {

    let env = configuration.getEnv();

    vultr.listInstances(env).then((servers) => {

        for (let server of servers) {

            console.log('====================');
            console.log(`ID: ${server.SUBID}`);
            console.log(`Status: ${server.status}, ${server.power_status}`);
            console.log(`IP: ${server.main_ip}`);
            console.log(`Location: ${server.location}`);
            console.log(`OS: ${server.os}`);
            console.log(`RAM: ${server.ram}`);
            console.log(`Disk: ${server.disk}`);
            console.log(`Label: ${server.label}`);

        }
    })
}

function selectInstance(id) {

    let env = configuration.getEnv();

    vultr.listInstances(env)
        .then((servers) => {

            let targetInstance = false;

            if (id) {

                let instance = servers.find(server => server.SUBID == id);
                if (!instance) {
                    console.log('Wrong instance ID');
                }

                configuration.modEnv('instanceID', instance.SUBID)

            } else {

                let instances = [];
                servers.map((server) => {
                    instances.push(`[${server.SUBID}]: ${server.main_ip}, ${server.location}`);
                });

                inquirer.prompt([{
                    type: 'list',
                    name: 'instance',
                    message: 'Select an instance',
                    choices: instances
                }])
                    .then((answer) => {
                        targetInstance = /[0-9]+/.exec(answer.instance)[0];
                        configuration.modEnv('instanceID', targetInstance);
                    })
            }


        }).catch((e) => {
        console.log(e);
        return false;
    });


}

function showInstance(detail) {

    let env = configuration.getEnv();
    let instanceId = env.instanceID;
    if (!instanceId) {

        console.log('Cannot get instanceID from config.json');
        return;

    }

    vultr.listInstances(env)
        .then((servers) => {

            let instance = servers.find(server => server.SUBID == instanceId);

            if (!instance) {

                console.log('Cannot find instance');
                return;

            }

            console.log(instance[detail] || `No option for ${detail}`)

        })
        .catch((e) => {
            console.log(e);
        })

}
module.exports = {displayInstances, selectInstance, showInstance};
