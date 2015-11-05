const PeriodicTask = require('periodic-task');
const fetch = require('node-fetch');

module.exports = (config, utils, db) => {
  const healthCheck = (hostName, host) => {
    utils.log('UPTIME', `Health checking ${hostName} with timeout ${host.timeout}`);
    const sendTime = (new Date()).getTime();
    return fetch(host.url, {timeout: host.timeout}).then((res) => {
      const expected = res.status === host.status;
      const responseTime = (new Date()).getTime() - sendTime;
      utils.log('UPTIME', 'Response time: ' + responseTime + 'ms');
      if (!expected) {
        utils.log('UPTIME', 'Unexpected status code: ' + res.status);
      }
      return expected;
    }).catch((err) => {
      utils.log('UPTIME', 'Error: ' + err);
      return false;
    });
  };

  const healthy = {};
  const healthyMsg = (host) => `${host} is back up`;
  const unhealthyMsg = (host) => `${host} is down`;
  // TODO: Unhealthy msg to check for how long it was down?

  const createHealthCheck = (hostName, host) => {
    utils.log('UPTIME', `Creating periodic task for ${hostName} with ${host.interval}ms interval`);

    const healthTask = new PeriodicTask(host.interval, () => {
      healthCheck(hostName, host).then((isHealthy) => {
        if (healthy[hostName] === null) {
          // First check doesn't exist, so force the first check to create an event
          healthy[hostName] = !isHealthy;
        }
        if (!isHealthy && healthy[hostName]) {
          utils.addEvent(hostName, 'Automatic', isHealthy, 'Health degraded', unhealthyMsg(hostName), db);
          healthy[hostName] = isHealthy;
        } else if (isHealthy && !healthy[hostName]) {
          utils.addEvent(hostName, 'Automatic', isHealthy, 'Health recovered', healthyMsg(hostName), db);
          healthy[hostName] = isHealthy;
        }
      }).catch(() => {
        if (healthy[hostName]) {
          utils.addEvent(hostName, 'Automatic', false, 'Health degraded', unhealthyMsg(hostName), db);
          healthy[hostName] = false;
        }
      });
    });

    db.get(`SELECT host,healthy FROM events WHERE host='${hostName}' ORDER BY time DESC LIMIT 1`, (err, hostStatus) => {
      if (err || !hostStatus) {
        utils.log('UPTIME', 'Failed to check last status of host, setting to first run to true to create first check');
        healthy[hostName] = null;
      } else {
        utils.log('UPTIME', `Setting last healthy status of host as healthy=${hostStatus.healthy}`);
        healthy[hostName] = hostStatus.healthy === 'true';
      }
      healthTask.run();
    });
  };

  Object.keys(config.hosts).map((key) => {
    const host = config.hosts[key];
    createHealthCheck(key, host);
  });
};
