async function downloadCSV(series, beginTime, endTime) {
  axios
    .get("/api/svg2m", {
      params: {
        beginTime: beginTime,
        endTime: endTime,
        series: series.join(","),
      },
    })
    .then(function (response) {
      const svg2mData = response?.data;
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      csvContent += `"STT","Seri",Ngày,"Thời gian","Kinh độ","Vĩ độ","Mode","DRA DoseRate (µSv/h)","DRA Dose (µSv)","Neutron","ACT - Alpha (CPS)","ACT - Beta (CPS)","ACT - Gamma (µSv/h)"\n`;
      svg2mData &&
        svg2mData.forEach((svg2m, index) => {
          const {
            seri,
            date,
            time,
            longitude,
            latitude,
            mode,
            draDoseRate,
            draDose,
            neutron,
            actAlpha,
            actBeta,
            actGamma,
          } = svg2m;
          csvContent += `${index},${seri},${date},${time},${longitude || ""},${
            latitude || ""
          },${mode},${draDoseRate},${draDose},${neutron},${actAlpha},${actBeta},${actGamma}\n`;
        });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `seri-${currentSeri}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log(csvContent);
    })
    .catch(function (error) {
      console.log(error);
    });
}

window.addEventListener("message", (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  if (data.type && data.type === "DOWNLOAD_DATA") {
    const { series, beginTime, endTime } = data;
    // if (!series || isNaN(beginTime) || isNaN(endTime)) {
    //   console.log("Missing seri, beginTime or endTime");
    //   return;
    // }
    console.log(series, beginTime, endTime);
    downloadCSV(series, beginTime, endTime);
  }
});
