import {log, timeDuration} from './utils';
import {addEvent} from './events';

import fetch from 'node-fetch';
import PeriodicTask from 'periodic-task';

const hostStatus = {};
const healthyMsg = (host, down) => {
  const now = new Date().getTime();
  if (!down) {
    return `${host} is back up.`;
  }
  const duration = timeDuration(now - down);
  return `${host} is back up. It was down for ${duration}.`;
};
const unhealthyMsg = (host) => `${host} is down.`;

const healthCheck = (hostName, host) => {
  log('UPTIME', `Health checking ${hostName} with timeout ${host.timeout}`);
  const sendTime = (new Date()).getTime();
  return fetch(host.url, {timeout: host.timeout}).then((res) => {
    const expected = res.status === host.status;
    const responseTime = (new Date()).getTime() - sendTime;
    log('UPTIME', 'Response time: ' + responseTime + 'ms');
    if (!expected) {
      log('UPTIME', 'Unexpected status code: ' + res.status);
    }
    return expected;
  }).catch((err) => {
    log('UPTIME', 'Error: ' + err);
    return false;
  });
};

export const createHealthCheck = (hostName, host) => {
  log('UPTIME', `Creating periodic task for ${hostName} with ${host.interval}ms interval`);

  let retries = host.retry;
  const handleTaskCatch = () => {
    if (hostStatus[hostName].healthy) {
      addEvent(hostName, 'Automatic', false, 'Health degraded', unhealthyMsg(hostName));
      hostStatus[hostName] = {
        healthy: false,
        down: new Date().getTime(),
      };
    }
  };

  const handleTaskReturn = (isHealthy) => {
    if (hostStatus[hostName] === undefined) {
      // First check doesn't exist, so force the first check to create an event
      hostStatus[hostName] = {
        healthy: !isHealthy,
      };
    }
    if (!isHealthy && hostStatus[hostName].healthy) {
      // Check if retry
      if (retries > 0) {
        retries -= 1;
        log('UPTIME', `Uptime check failed. Retrying ${retries} more times..`);
        // Retry in 500ms
        setTimeout(() => {
          healthCheck(hostName, host).then(handleTaskReturn).catch(handleTaskCatch);
        }, 500);
      } else {
        addEvent(hostName, 'Automatic', isHealthy, 'Health degraded', unhealthyMsg(hostName));
        hostStatus[hostName] = {
          healthy: isHealthy,
          down: new Date().getTime(),
        };
      }
    } else if (isHealthy && !hostStatus[hostName].healthy) {
      retries = host.retry;
      addEvent(hostName, 'Automatic', isHealthy, 'Health recovered', healthyMsg(hostName, hostStatus[hostName].down));
      hostStatus[hostName].healthy = isHealthy;
    }
  };

  const task = () => {
    healthCheck(hostName, host).then(handleTaskReturn).catch(handleTaskCatch);
  };
  new PeriodicTask(host.interval, task).run();
};
