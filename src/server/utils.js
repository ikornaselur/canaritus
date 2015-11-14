import moment from 'moment';

const timeStamp = () => {
  const now = new Date();
  const twoNum = (num) => {
    return num < 10 ? '0' + num : num.toString();
  };
  const date = `${now.getFullYear()}-${twoNum(now.getMonth())}-${twoNum(now.getDate())}`;
  const time = `${twoNum(now.getHours())}:${twoNum(now.getMinutes())}:${twoNum(now.getSeconds())}`;
  return `${date} ${time}`;
};

export const log = (type, string) => {
  console.log(`${timeStamp()} - ${type} - ${string}`);
};

export const timeDuration = (ms) => {
  const duration = moment.duration(ms);
  const values = [];
  if (duration.days() > 0) {
    values.push(`${duration.days()} day${duration.days() === 1 ? '' : 's'}`);
  }
  if (duration.hours()) {
    values.push(`${duration.hours()} hour${duration.hours() === 1 ? '' : 's'}`);
  }
  if (duration.minutes()) {
    values.push(`${duration.minutes()} minute${duration.minutes() === 1 ? '' : 's'}`);
  }
  if (duration.seconds()) {
    values.push(`${duration.seconds()} second${duration.seconds() === 1 ? '' : 's'}`);
  }

  if (values.length === 1) {
    return values[0];
  }
  const end = ` and ${values.pop()}`;

  return values.join(', ') + end;
};
