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
  const createHealthCheck = (host, url, status, interval) => {
    utils.log('UPTIME', `Creating periodic task for ${host} with ${interval}ms interval`);
    healthy[url] = true;
    const healthTask = new PeriodicTask(interval, () => {
      healthCheck(host, url, status).then((isHealthy) => {
        if (!isHealthy && healthy[url]) {
          utils.addEvent('Health degraded', `Health check failed for ${host}.`, db);
          healthy[url] = false;
        } else if (isHealthy && !healthy[url]) {
          utils.addEvent('Health recovered', `Health check was successful for ${host}`, db);
          healthy[url] = true;
        }
      }).catch((err) => {
        utils.log('UPTIME', 'Error doing a healthcheck:', err);
        if (healthy[url]) {
          utils.addEvent('Health degraded', `Health check failed for ${host}.`, db);
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
