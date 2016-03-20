import moment from 'moment';

const timeStamp = () => {
  const now = new Date();
  const twoNum = (num) => num < 10 ? `0${num}` : num.toString();
  const date = `${now.getFullYear()}-${twoNum(now.getMonth())}-${twoNum(now.getDate())}`;
  const time = `${twoNum(now.getHours())}:${twoNum(now.getMinutes())}:${twoNum(now.getSeconds())}`;
  return `${date} ${time}`;
};

export const log = (type, string, extra = null) => {
  let out = `${timeStamp()} - ${type} - ${string}`;
  if (extra) {
    out += ` - ${extra}`;
  }
  console.log(out);
};

export const timeDuration = (ms) => {
  const duration = moment.duration(ms);
  let ret = '';
  let days = false;
  let hours = false;
  if (duration.days() > 0) {
    ret = `${duration.days()} day${duration.days() === 1 ? '' : 's'}, `;
    days = true;
  }
  if (duration.hours() || days) {
    ret += `${duration.hours()} hour${duration.hours() === 1 ? '' : 's'}, `;
    hours = true;
  }
  if (duration.minutes() || hours) {
    ret += `${duration.minutes()} minute${duration.minutes() === 1 ? '' : 's'}, `;
  }
  ret += `and ${duration.seconds()} second${duration.seconds() === 1 ? '' : 's'}`;
  return ret;
};

export const randHash = (len) =>
  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, len);
