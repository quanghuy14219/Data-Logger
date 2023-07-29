function convertMillisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const formattedDay = day < 10 ? "0" + day : day;
  const formattedMonth = month < 10 ? "0" + month : month;
  const formattedHours = hours < 10 ? "0" + hours : hours;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
  const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  return [formattedDate, formattedTime];
}

function convertStringToDate(datePart, timePart) {
  var dateComponents = datePart.split("/");
  var day = parseInt(dateComponents[0], 10);
  var month = parseInt(dateComponents[1], 10) - 1;
  var year = parseInt(dateComponents[2], 10);

  var timeComponents = timePart.split(":");
  var hours = parseInt(timeComponents[0], 10);
  var minutes = parseInt(timeComponents[1], 10);
  var seconds = parseInt(timeComponents[2], 10);

  var date = new Date(year, month, day, hours, minutes, seconds);

  return date;
}

class SVG2MChart {
  constructor(root) {
    this.root = root;
    this.root.container.set("layout", root.verticalLayout);
    this.data = [];
    this.needUpdate = false;
    this.lastUpdate = null;
    this.updateEvery = 10000; //ms
    this.updateInterval = null;
    // chart
    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
      })
    );

    // cursor
    this.cursor = this.chart.set(
      "cursor",
      am5xy.XYCursor.new(this.root, {
        behavior: "zoomX",
      })
    );
    this.cursor.lineY.set("visible", true);

    // X-Axis
    this.xAxis = this.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(this.root, {
        baseInterval: {
          timeUnit: "second",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
      })
    );
    this.xAxis.children.push(
      am5.Label.new(this.root, {
        text: "Thời gian (GMT+7)",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        fontSize: 20,
      })
    );

    // yAxises

    // DRA Dose Y Axis
    this.draDoseRateYAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
      })
    );
    this.draDoseRateYLabel = am5.Label.new(this.root, {
      text: "DRA Dose Rate \n (µSv / h)",
      textAlign: "center",
      y: am5.p50,
      fontSize: 20,
      rotation: -90,
      fill: am5.color(0x095256),
    });
    this.draDoseRateYAxis.children.unshift(this.draDoseRateYLabel);

    // ACT Alpha Y Axis
    this.actAlphaYAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
        marginTop: 30,
      })
    );
    this.actAlphaYLabel = am5.Label.new(this.root, {
      text: "ACT - Alpha \n (CPS)",
      textAlign: "center",
      y: am5.p50,
      fontSize: 20,
      rotation: -90,
      fill: am5.color(0x1a5a95),
    });
    this.actAlphaYAxis.children.unshift(this.actAlphaYLabel);

    // ACT Beta Y Axis
    this.actBetaYAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
        marginTop: 30,
      })
    );
    this.actBetaYLabel = am5.Label.new(this.root, {
      text: "ACT - Beta \n (CPS)",
      textAlign: "center",
      y: am5.p50,
      fontSize: 20,
      rotation: -90,
      fill: am5.color(200, 100, 0),
    });
    this.actBetaYAxis.children.unshift(this.actBetaYLabel);

    // ACT Gamma Y Axis
    this.actGammaYAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
        marginTop: 30,
      })
    );
    this.actGammaYLabel = am5.Label.new(this.root, {
      text: "ACT - Gamma \n (µSv/h)",
      textAlign: "center",
      y: am5.p50,
      fontSize: 20,
      rotation: -90,
      fill: am5.color(200, 100, 0),
    });
    this.actGammaYAxis.children.unshift(this.actGammaYLabel);

    // Stack Y-axes
    this.chart.leftAxesContainer.set("layout", this.root.verticalLayout);
    // this.chart.leftAxesContainer.set("paddingTop", "20px");

    // series
    this.draDoseRateSeries = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: "Series",
        xAxis: this.xAxis,
        yAxis: this.draDoseRateYAxis,
        valueYField: "draDoseRate",
        valueXField: "date",
        tooltip: am5.Tooltip.new(this.root, {
          labelText: "{valueY}",
        }),
      })
    );

    this.actAlphaSeries = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: "Series",
        xAxis: this.xAxis,
        yAxis: this.actAlphaYAxis,
        valueYField: "actAlpha",
        valueXField: "date",
        tooltip: am5.Tooltip.new(this.root, {
          labelText: "{valueY}",
        }),
      })
    );

    this.actBetaSeries = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: "Series",
        xAxis: this.xAxis,
        yAxis: this.actBetaYAxis,
        valueYField: "actBeta",
        valueXField: "date",
        tooltip: am5.Tooltip.new(this.root, {
          labelText: "{valueY}",
        }),
      })
    );

    this.actGammaSeries = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: "Series",
        xAxis: this.xAxis,
        yAxis: this.actGammaYAxis,
        valueYField: "actGamma",
        valueXField: "date",
        tooltip: am5.Tooltip.new(this.root, {
          labelText: "{valueY}",
        }),
      })
    );

    // Scrollbar
    this.scrollbar = am5xy.XYChartScrollbar.new(this.root, {
      orientation: "horizontal",
      height: 50,
    });
    this.chart.set("scrollbarX", this.scrollbar);

    this.sbxAxis = this.scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(this.root, {
        baseInterval: {
          timeUnit: "second",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(this.root, {
          opposite: false,
          strokeOpacity: 0,
        }),
      })
    );

    this.sbyDraDoseRateAxis = this.scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );
    this.sbyActAlphaAxis = this.scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );
    this.sbyActBetaAxis = this.scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );

    this.sbDraDoseRateSeries = this.scrollbar.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        xAxis: this.sbxAxis,
        yAxis: this.sbyDraDoseRateAxis,
        valueYField: "draDoseRate",
        valueXField: "date",
      })
    );
    this.sbActAlphaSeries = this.scrollbar.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        xAxis: this.sbxAxis,
        yAxis: this.sbyActAlphaAxis,
        valueYField: "actAlpha",
        valueXField: "date",
      })
    );
    this.sbActBetaSeries = this.scrollbar.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        xAxis: this.sbxAxis,
        yAxis: this.sbyActBetaAxis,
        valueYField: "actBeta",
        valueXField: "date",
      })
    );

    this.draDoseRateSeries.appear(1000, 0);
    this.actAlphaSeries.appear(1000, 0);
    this.actBetaSeries.appear(1000, 0);
    this.actGammaSeries.appear(1000, 0);
    this.chart.appear(1000, 0);
  }

  // Tell it that only update after a time
  setUpdate(time) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.updateInterval = setInterval(() => {
      if (this.needUpdate) {
        this.update(this.data);
        this.lastUpdate = Date.now();
        this.needUpdate = false;
      }
    }, time);
  }

  update(data) {
    // DRA Dose Rate
    this.draDoseRateSeries.data.setAll(data);
    this.draDoseRateSeries.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 5,
          fill: this.draDoseRateSeries.get("fill"),
          stroke: this.root.interfaceColors.get("background"),
          strokeWidth: 2,
        }),
      });
    });
    // ACT Alpha
    this.actAlphaSeries.data.setAll(data);
    this.actAlphaSeries.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 5,
          fill: this.actAlphaSeries.get("fill"),
          stroke: this.root.interfaceColors.get("background"),
          strokeWidth: 2,
        }),
      });
    });

    // ACT Beta
    this.actBetaSeries.data.setAll(data);
    this.actBetaSeries.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 5,
          fill: this.actBetaSeries.get("fill"),
          stroke: this.root.interfaceColors.get("background"),
          strokeWidth: 2,
        }),
      });
    });

    // ACT Gamma
    this.actGammaSeries.data.setAll(data);
    this.actGammaSeries.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 5,
          fill: this.actGammaSeries.get("fill"),
          stroke: this.root.interfaceColors.get("background"),
          strokeWidth: 2,
        }),
      });
    });

    this.sbDraDoseRateSeries.data.setAll(data);
    this.sbActAlphaSeries.data.setAll(data);
    this.sbActBetaSeries.data.setAll(data);
    // this.sbActGammaSeries.data.setAll(data);
  }

  setData(data, force = false) {
    if (force) {
      this.update(data);
      this.needUpdate = false;
      this.data = data;
      return;
    }
    if (this.data.length === 0) {
      this.update(data);
    } else {
      this.needUpdate = true;
    }
    this.data = data;
  }
}

am5.ready(() => {
  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  const root = am5.Root.new("chartdiv");
  root.setThemes([am5themes_Animated.new(this.root)]);

  const chart = new SVG2MChart(root);
  chart.setUpdate(10000);

  window.addEventListener("message", async (event) => {
    if (event.source !== window || event.origin !== window.location.origin) {
      return;
    }
    const { data } = event;

    // handle change marker event
    if (data.type && data.type === "LOAD_CHART_DATA") {
      const chartData = currentData.map((svg2m) => {
        return {
          date: convertStringToDate(svg2m.date, svg2m.time).getTime(),
          draDoseRate: svg2m.draDoseRate,
          actAlpha: svg2m.actAlpha,
          actBeta: svg2m.actBeta,
          actGamma: svg2m.actGamma,
        };
      });
      chartData.sort((d1, d2) => d1.date - d2.date);
      chart.setData(chartData, currentLabel);
      if (chart.needUpdate && data.force) {
        chart.update();
      }
    }
  });
});
