// import {createHealthCheck} from '../../src/server/tasks';
import * as utils from '../../src/server/utils';
// import {expect} from 'chai';
// import fetch from 'node-fetch';
// import PeriodicTask from 'periodic-task';
import sinon from 'sinon';

describe('Tasks', () => {
  describe('Health Checks', () => {
    beforeEach(() => {
      sinon.stub(utils, 'log');
    });

    it('Should create a periodic task', () => {
    });

    afterEach(() => {
      utils.log.restore();
    });
  });
});
