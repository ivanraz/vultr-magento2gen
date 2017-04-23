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

function getPlansDetails(env) {

  return new Promise((fulfill, reject) => {

    let api = env.vultr;
    let instance = new Vultr(api);

    let plans = instance.plans.list().then(plans => plans);
    let regions = instance.regions.list().then(regions => regions);
    let os = instance.os.list().then(os => os);

    Promise.all([plans, regions, os])
      .then(values => {
        fulfill({
          plans: values[0],
          regions: values[1],
          os: values[2]
        });
      })
      .catch(e => {
        reject(e)
      })
  });
}

function objectsToArrayOfObjects(obj) {

  let arr = [];
  Object.keys(obj).forEach((key) => {

    arr[key] = obj[key];

  });

  return arr;

}

function createInstance(planId, regionId, osId, env) {

  return new Promise((fulfill, reject) => {

    let api = env.vultr;
    let vultrInstance = new Vultr(api);

    vultrInstance.server.create({
      plan: planId,
      os: osId,
      region: regionId

    })
      .then((res) => {
        fulfill(res);
      })
      .catch(e => {
        reject(e);
      })


  });


}

module.exports = {
  checkVultrApi,
  listInstances,
  selectInstance,
  getPlansDetails,
  objectsToArrayOfObjects,
  createInstance
};