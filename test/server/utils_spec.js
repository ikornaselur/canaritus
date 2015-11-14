import {timeDuration} from '../../src/server/utils';
import {expect} from 'chai';

describe('Utils', () => {
  describe('Time duration', () => {
    it('is correct for seconds', () => {
      const seconds = 1000 * 10;
      const duration = timeDuration(seconds);

      expect(duration).to.equal('10 seconds');
    });

    it('is correct for minutes', () => {
      const minutes = 1000 * 60 * 2;
      const duration = timeDuration(minutes);

      expect(duration).to.equal('2 minutes');
    });

    it('is correct for hours', () => {
      const hours = 1000 * 60 * 60 * 2;
      const duration = timeDuration(hours);

      expect(duration).to.equal('2 hours');
    });

    it('is correct for days', () => {
      const days = 1000 * 60 * 60 * 24 * 2;
      const duration = timeDuration(days);

      expect(duration).to.equal('2 days');
    });

    it('is correct for minutes and seconds', () => {
      const minutes = 1000 * 60 * 2;
      const seconds = 1000 * 30;
      const duration = timeDuration(minutes + seconds);

      expect(duration).to.equal('2 minutes and 30 seconds');
    });

    it('is correct for hours and minutes', () => {
      const hours = 1000 * 60 * 60 * 2;
      const minutes = 1000 * 60 * 30;
      const duration = timeDuration(hours + minutes);

      expect(duration).to.equal('2 hours and 30 minutes');
    });

    it('is correct for hours, minutes and seconds', () => {
      const hours = 1000 * 60 * 60 * 2;
      const minutes = 1000 * 60 * 30;
      const seconds = 1000 * 30;
      const duration = timeDuration(hours + minutes + seconds);

      expect(duration).to.equal('2 hours, 30 minutes and 30 seconds');
    });

    it('is correct for hours and seconds', () => {
      const hours = 1000 * 60 * 60 * 2;
      const seconds = 1000 * 30;
      const duration = timeDuration(hours + seconds);

      expect(duration).to.equal('2 hours and 30 seconds');
    });

    it('is correct for days and seconds', () => {
      const days = 1000 * 60 * 60 * 24 * 2;
      const seconds = 1000 * 30;
      const duration = timeDuration(days + seconds);

      expect(duration).to.equal('2 days and 30 seconds');
    });

    it('is correct for singular values', () => {
      const second = 1000;
      const minute = second * 60;
      const hour = minute * 60;
      const day = hour * 24;

      expect(timeDuration(second)).to.equal('1 second');
      expect(timeDuration(minute)).to.equal('1 minute');
      expect(timeDuration(hour)).to.equal('1 hour');
      expect(timeDuration(day)).to.equal('1 day');
    });
  });
});
