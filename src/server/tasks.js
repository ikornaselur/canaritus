import {log, timeDuration} from './utils';
import {addEvent} from './events';

import fetch from 'node-fetch';
import PeriodicTask from 'periodic-task';

const RETRY_TIMEOUT = 500;

const hostStatus = {};
const healthyMsg = (host, down) => {
  const now = new Date().getTime();
  if (!down) {
    return `${host} is back up.`;
  }
  const duration = timeDuration(now - down);
  return `${host} is back up. It was down for ${duration}.`;
};
const healthyTitle = (host) => `Health recovered for ${host}`;
const unhealthyMsg = (host) => `${host} is down.`;
const unhealthyTitle = (host) => `Health degraded for ${host}`;

const healthCheck = (hostName, host) => {
  log('UPTIME', `Health checking ${hostName} with ${host.timeout}s timeout`);
  const sendTime = (new Date()).getTime();
  return fetch(host.url, {timeout: host.timeout * 1000}).then((res) => {
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
  log('UPTIME', `Creating periodic task for ${hostName} with ${host.interval}s interval`);

  let retries = host.retry;
  let retrying = false;
  const handleTaskCatch = () => {
    if (hostStatus[hostName].healthy) {
      addEvent(hostName, 'Automatic', false, unhealthyTitle(hostName), unhealthyMsg(hostName));
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
        retrying = true;
        log('UPTIME', `Uptime check failed. Retrying ${retries} more times..`);
        retries -= 1;
        // Retry in 500ms
        setTimeout(() => {
          healthCheck(hostName, host).then(handleTaskReturn).catch(handleTaskCatch);
        }, RETRY_TIMEOUT);
      } else {
        addEvent(hostName, 'Automatic', isHealthy, unhealthyTitle(hostName), unhealthyMsg(hostName));
        hostStatus[hostName] = {
          healthy: isHealthy,
          down: new Date().getTime(),
        };
      }
    } else if (isHealthy && !hostStatus[hostName].healthy) {
      retries = host.retry;
      addEvent(hostName, 'Automatic', isHealthy, healthyTitle(hostName), healthyMsg(hostName, hostStatus[hostName].down));
      hostStatus[hostName].healthy = isHealthy;
    }
    // Reset retrying if applicable
    if (isHealthy && hostStatus[hostName].healthy && retrying) {
      retrying = false;
      retries = host.retry;
    }
  };

  const task = () => {
    healthCheck(hostName, host).then(handleTaskReturn).catch(handleTaskCatch);
  };
  new PeriodicTask(host.interval * 1000, task).run();
};
