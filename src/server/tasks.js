const PeriodicTask = require('periodic-task');
const fetch = require('node-fetch');

module.exports = (config, utils, db) => {
  const healthCheck = (host, url, status) => {
    utils.log('UPTIME', `Health checking ${host}`);
    return fetch(url, {timeout: 10000}).then((res) => {
      return res.status === status;
    }).catch(() => {
      return false;
    });
  };

  const healthy = {};
  const healthyMsg = (host) => `${host} is back up`;
  const unhealthyMsg = (host) => `${host} is down`;
  // TODO: Unhealthy msg to check for how long it was down?

  const createHealthCheck = (host, url, status, interval) => {
    utils.log('UPTIME', `Creating periodic task for ${host} with ${interval}ms interval`);

    const healthTask = new PeriodicTask(interval, () => {
      healthCheck(host, url, status).then((isHealthy) => {
        if (healthy[host] === null) {
          // First check doesn't exist, so force the first check to create an event
          healthy[host] = !isHealthy;
        }
        if (!isHealthy && healthy[host]) {
          utils.addEvent(host, 'Automatic', isHealthy, 'Health degraded', unhealthyMsg(host), db);
          healthy[host] = isHealthy;
        } else if (isHealthy && !healthy[host]) {
          utils.addEvent(host, 'Automatic', isHealthy, 'Health recovered', healthyMsg(host), db);
          healthy[host] = isHealthy;
        }
      }).catch(() => {
        if (healthy[host]) {
          utils.addEvent(host, 'Automatic', false, 'Health degraded', unhealthyMsg(host), db);
          healthy[host] = false;
        }
      });
    });
    db.get(`SELECT host,healthy FROM events WHERE host='${host}' ORDER BY time DESC LIMIT 1`, (err, hostStatus) => {
      if (err || !hostStatus) {
        utils.log('UPTIME', 'Failed to check last status of host, setting to first run to true to create first check');
        healthy[host] = null;
      } else {
        healthy[host] = hostStatus.healthy;
      }
      healthTask.run();
    });
  };

  Object.keys(config.hosts).map((key) => {
    const host = config.hosts[key];
    createHealthCheck(key, host.url, host.status, host.interval);
  });
};
