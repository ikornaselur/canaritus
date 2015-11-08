import {log} from './utils';
import {addEvent} from './events';

import fetch from 'node-fetch';
import PeriodicTask from 'periodic-task';

const healthy = {};
const healthyMsg = (host) => `${host} is back up`;
const unhealthyMsg = (host) => `${host} is down`;

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
    if (healthy[hostName]) {
      addEvent(hostName, 'Automatic', false, 'Health degraded', unhealthyMsg(hostName));
      healthy[hostName] = false;
    }
  };

  const handleTaskReturn = (isHealthy) => {
    if (healthy[hostName] === null) {
      // First check doesn't exist, so force the first check to create an event
      healthy[hostName] = !isHealthy;
    }
    if (!isHealthy && healthy[hostName]) {
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
        healthy[hostName] = isHealthy;
      }
    } else if (isHealthy && !healthy[hostName]) {
      retries = host.retry;
      addEvent(hostName, 'Automatic', isHealthy, 'Health recovered', healthyMsg(hostName));
      healthy[hostName] = isHealthy;
    }
  };

  const task = () => {
    healthCheck(hostName, host).then(handleTaskReturn).catch(handleTaskCatch);
  };
  new PeriodicTask(host.interval, task).run();
};
