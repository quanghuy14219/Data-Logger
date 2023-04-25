export const parseData = (data) => {
  const day = data.time.getDate().toString().padStart(2, "0");
  const month = (data.time.getMonth() + 1).toString().padStart(2, "0");
  const year = data.time.getFullYear().toString();
  const dateStr = `${day}/${month}/${year}`;

  const hours = data.time.getHours().toString().padStart(2, "0");
  const minutes = data.time.getMinutes().toString().padStart(2, "0");
  const seconds = data.time.getSeconds().toString().padStart(2, "0");

  const timeStr = `${hours}:${minutes}:${seconds}`;

  const convert = {
    ...data._doc,
    date: dateStr,
    time: timeStr,
  };
  return convert;
};
