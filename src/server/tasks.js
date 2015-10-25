const PeriodicTask = require('periodic-task');
const fetch = require('node-fetch');

module.exports = (config, utils, db) => {
  const healthCheck = (host, url, status) => {
    utils.log('UPTIME', `Health checking ${host}`);
    return fetch(url).then((res) => {
      return res.status === status;
    });
  };

  const healthy = {};
  const healthyMsg = (host) => `${host} is back up`;
  const unhealthyMsg = (host) => `${host} is down`;
  // TODO: Unhealthy msg to check for how long it was down?


  const createHealthCheck = (host, url, status, interval) => {
    utils.log('UPTIME', `Creating periodic task for ${host} with ${interval}ms interval`);
    healthy[url] = true;
    const healthTask = new PeriodicTask(interval, () => {
      healthCheck(host, url, status).then((isHealthy) => {
        if (!isHealthy && healthy[url]) {
          utils.addEvent(host, 'Automatic', isHealthy, 'Health degraded', unhealthyMsg(host), db);
          healthy[url] = isHealthy;
        } else if (isHealthy && !healthy[url]) {
          utils.addEvent(host, 'Automatic', isHealthy, 'Health recovered', healthyMsg(host), db);
          healthy[url] = isHealthy;
        }
      }).catch(() => {
        if (healthy[url]) {
          utils.addEvent(host, 'Automatic', false, 'Health degraded', unhealthyMsg(host), db);
          healthy[url] = false;
        }
      });
    });
    healthTask.run();
  };

  Object.keys(config).map((key) => {
    const host = config[key];
    createHealthCheck(key, host.url, host.status, host.interval);
  });
};
