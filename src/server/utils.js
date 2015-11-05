const timeStamp = () => {
  const now = new Date();
  const twoNum = (num) => {
    return num < 10 ? '0' + num : num.toString();
  };
  const date = `${now.getFullYear()}-${twoNum(now.getMonth())}-${twoNum(now.getDate())}`;
  const time = `${twoNum(now.getHours())}:${twoNum(now.getMinutes())}:${twoNum(now.getSeconds())}`;
  return `${date} ${time}`;
};

export function log(type, string) {
  console.log(`${timeStamp()} - ${type} - ${string}`);
}
