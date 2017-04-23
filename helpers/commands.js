const vultr = require('./vultr');
const configuration = require('./configuration');
const inquirer = require('inquirer');
const _ = require('lodash');

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

function unselectInstance() {

  configuration.delEnv('instanceID');
  console.log('Instance no longer selected');

}

function createInstance() {

  let env = configuration.getEnv();
  let planChoices, regionsChoices, osChoices;
  vultr.getPlansDetails(env)
    .then(planDetails => {



      let plans = vultr.objectsToArrayOfObjects(planDetails.plans);
      let regions = vultr.objectsToArrayOfObjects(planDetails.regions);
      let os = vultr.objectsToArrayOfObjects(planDetails.os);

      planChoices = [];
      plans
        .filter(plan => !_.isEmpty(plan.available_locations))
        .map((plan) => {
        planChoices.push(`[${plan.VPSPLANID}]: ${plan.name}, ${plan.vcpu_count} VCPU, ${plan.price_per_month}$/m`)
      });

      let planId, regionId, osId;

      inquirer.prompt({
        type: 'list',
        name: 'plan',
        message: 'Select a plan',
        choices: planChoices
      }).then((answer) => {

        planId = /[0-9]+/.exec(answer.plan)[0];

        let regionsIds = plans[planId].available_locations;
        regionsChoices = [];

        if (!_.isEmpty(regionsIds)) {

          regionsIds.map((id) => {
            regionsChoices.push(`[${id}]: ${regions[id].name}, ${regions[id].country}`)
          });

        } else {

          regions.map((region) => {
            regionsChoices.push(`[${region.DCID}]: ${region.name}, ${region.country}`)
          });

        }

        inquirer.prompt({
          type: 'list',
          name: 'region',
          message: 'Select a region',
          choices: regionsChoices
        }).then((answer) => {

          regionId = /[0-9]+/.exec(answer.region)[0];

          osChoices = [];
          os
            .filter((sys) => sys.windows == false && sys.arch == 'x64' && sys.family == 'ubuntu')
            .map((sys) => { osChoices.push(`[${sys.OSID}]: ${sys.name}`) });

          inquirer.prompt({
            type: 'list',
            name: 'os',
            message: 'Select an OS',
            choices: osChoices
          }).then((answer) => {

            osId = /[0-9]+/.exec(answer.os)[0];

            inquirer.prompt({
              type: 'confirm',
              name: 'create',
              message: 'Are you sure?',
              default: false

            }).then((answer) => {

              if (answer.create !== true) return;

              vultr.createInstance(planId, regionId, osId, env)
                .then((server) => {
                console.log(`Instance created, ID: ${server.SUBID}`);
              }).catch(e => console.log(e));

            })

          })

        });
      });

    })
    .catch(e => {
      console.log(e);
    });

}
module.exports = {displayInstances, selectInstance, showInstance, unselectInstance, createInstance};
