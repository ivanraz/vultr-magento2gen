const _ = require('lodash');
const Vultr = require('vultr');
function checkVultrApi(env) {

    let api = env.vultr;
    return new Promise((fulfill, reject) => {

        if (env.validApi) {
            fulfill();
        }

        let instance = new Vultr(api);
        instance.account.info().then((info) => {

            if (!_.isEmpty(info)) {
                fulfill(info)
            }

        }).catch(e => {
            reject(e);
        });

    });
}

function listInstances(env) {

    return new Promise((fulfill, reject) => {

        let instance = new Vultr(env.vultr);
        instance.server.list()
            .then((response) => {

                let servers = [];

                Object.keys(response).forEach((key) => {
                    servers.push(response[key]);
                });

                fulfill(servers);

            })
            .catch((e) => {
                reject(e);
            });
    });


}

function selectInstance(env, id) {

    if (id) {
        console.log('selected id:', id)
    } else {
        console.log('no id selected')
    }
}

module.exports = {checkVultrApi, listInstances, selectInstance};