const capturer = new CCapture({
  framerate: 60,
  format: "webm",
  name: "Spiral_Hour_Zurich",
  quality: 100,
  verbose: true,
});

let data;
let arrayWithTempValuesZurich = [];
let arrayWithTempValuesBasel = [];
let arrayWithStromValuesBasel = [];
let arrayWithStromValuesZurich = [];
let timeObjects = [];
let valueArray = [];

let wochenUnterteilung = 360 / 7;
let wochenTage = [
  "montag",
  "dienstag",
  "mittwoch",
  "donerstag",
  "freitag",
  "samstag",
  "sonntag",
];

let numRows;

let counter = 0;
let previousTime = 0;

// Für die Temperatur in Zürich hat es 314 Einträge ohne Wert (NA)
// diese Werte wurden mit 123456789 ersetzt
// Möglich wäre es zu interpolieren, aber so kann sichtbar
// gemacht werden, dass es fehlende Werte in den Daten gibt.
// Das Minimum und Maximum wurden manuell aus den Daten genommen, weil min() und max()
// nicht funktionieren bei so grosser Datenmenge

let maxTempZurich = 35.4;
let minTempZurich = -8.4;
let maxStromZurich = 116593;
let minStromZurich = 45505;

let maxTempBasel = 38.6;
let minTempBasel = -13;
let maxStromBasel = 57731;
let minStromBasel = 22355;
let resizeTimer;
let zürichbaselabstand;
let abstandobenunten;
let abstandTag;
let abstandSkala;

let lineLength;
let grafikOffset;
let linedashKoeff;
let myFont;
let ringratio = 3.5;
let skalaFarbe;
let weiss = 255;
let liniendicke;
let titelJahrgrösse;
let stadtTextgrösse;
let skalaTextgrösse;
let timerTextgrösse;
let strokeDickeArc;

let ratio = 1.77;
let ratioPaddinglinksrechts = 8;
let ratioPaddingobenunten = 12;

let jahr = 2019;

function preload() {
  data = loadTable("dataStromTemp15Min.csv", "csv", "header");
}

function setup() {
  colorMode(RGB);
  pixelDensity(1);
  valueArray = [];
  createCanvas(windowWidth, windowHeight); //3840 x 2160
  background(0);
  paddinglinksrechts = windowWidth / ratioPaddinglinksrechts;
  paddingobenunten = windowWidth / ratioPaddingobenunten;
  jahrpadding = paddingobenunten / 2;

  myFont = loadFont("Roboto-Regular.ttf");
  textFont(myFont);

  angleMode(DEGREES);

  linedashKoeff = ceil(windowWidth / 300);

  zürichbaselabstand = paddinglinksrechts / 2;
  abstandobenunten = paddingobenunten / 3;
  abstandTag = (paddingobenunten / 4) * 3;
  abstandSkala = paddinglinksrechts / 2;
  titelJahrgrösse = floor(windowWidth / 80);
  stadtTextgrösse = floor(windowWidth / 100);
  timerTextgrösse = floor(windowWidth / 120);
  skalaTextgrösse = floor(windowWidth / 120);
  lineLength = ceil(windowWidth / 250);
  skalaFarbe = 100;
  liniendicke = floor(windowWidth / 1500);

  if (liniendicke <= 0) {
    liniendicke = 0.5;
  }

  //console.log(timerTextgrösse);

  if (titelJahrgrösse < 15) {
    titelJahrgrösse = 15;
  }
  if (stadtTextgrösse < 11) {
    stadtTextgrösse = 11;
  }
  if (timerTextgrösse < 11) {
    timerTextgrösse = 11;
  }
  if (skalaTextgrösse < 11) {
    skalaTextgrösse = 11;
  }

  /*   if (windowHeight > windowWidth) {
          windowHeight = windowWidth;
        } */

  numRows = data.getRowCount();
  let zurichStromValues = int(data.getColumn("StromverbrauchZurich"));
  let baselStromValues = int(data.getColumn("StromverbrauchBasel"));
  let zurichTempValues = float(data.getColumn("TempZurich"));
  let baselTempValues = float(data.getColumn("TempBasel"));
  let timestampsInDataZB = data.getColumn("time");

  for (let i = 0; i < numRows; i++) {
    let stromZurich = zurichStromValues[i];
    let stromBasel = baselStromValues[i];
    let tempZurich = zurichTempValues[i];
    let tempBasel = baselTempValues[i];
    let timestamp = timestampsInDataZB[i];
    let date = new Date(timestamp);
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    let stunde = String(date.getHours()).padStart(2, "0");
    let dayofMonth = date.getDate(timestamp);
    let quarterHourRaw = quarterHourofTimestamp(timestamp);
    let dateString = `${day}.${month}.${year} ${stunde}`;
    let quarterHours = quarterHourofTimestamp(timestamp);
    let weekday = getWeekday(timestamp);
    let monthRaw = getMonth(timestamp);
    weekday = map(weekday, 0, 7, 0, 360) - 90;
    quarterHours = map(quarterHours, 0, 96, 0, 360 / 12);
    monthRaw = map(monthRaw, 0, 12, 0, 360) - 90;
    dayofMonth = map(dayofMonth, 1, 32, 0, 360) - 90;
    let winkel = monthRaw + quarterHours;

    let realstromZ = stromZurich / 150;
    let realstromB = stromBasel / 150;

    let stromZ;
    let stromB;
    let x;
    let y;
    let x2;
    let y2;

    stromZ = map(
      stromZurich,
      0,
      120000,
      0,
      windowWidth / ringratio - paddinglinksrechts
    );
    stromB = map(
      stromBasel,
      0,
      120000,
      0,
      windowWidth / ringratio - paddinglinksrechts
    );
    x = stromZ * cos(winkel);
    y = stromZ * sin(winkel);
    x2 = stromB * cos(winkel);
    y2 = stromB * sin(winkel);
    valueArray.push([x, y, x2, y2, dateString, quarterHourRaw]);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeAction, 200);
}
function resizeAction() {
  window.location.reload();
  setup();
  redraw();
}

function SpiralStatic() {
  noLoop();
  //background(0);

  strokeCap(SQUARE);
  for (let i = 0; i < valueArray.length - 1; i++) {
    let quarterHourH = valueArray[i][5];
    if (quarterHourH != 95) {
      stroke(weiss, 80);
      strokeWeight(liniendicke);
      //Zürich
      push();
      translate(windowWidth / 4, windowHeight / 2);
      line(
        valueArray[i][0],
        valueArray[i][1],
        valueArray[i + 1][0],
        valueArray[i + 1][1]
      );
      pop();
      //Basel
      push();
      stroke(weiss, 40);
      strokeWeight(liniendicke);
      translate((windowWidth / 4) * 3, windowHeight / 2);
      line(
        valueArray[i][2],
        valueArray[i][3],
        valueArray[i + 1][2],
        valueArray[i + 1][3]
      );
      pop();
    }
  }
  noStroke();
  fill(weiss);
  textAlign(CENTER, CENTER);
  textSize(timerTextgrösse);
  // console.log(timerTextgrösse);
  text(jahr, windowWidth / 2, windowHeight - jahrpadding);
  // text(jahr, windowWidth / 2, windowHeight - jahrpadding);
}

function spiralAnim() {
  /*   fill(0);
    noStroke();
    rect(0, 0, width, paddingobenunten + 1);
    // rect(0, 0, paddinglinksrechts + 1, height);
    rect(0, height - paddingobenunten - 1, width, height);
    // rect(width - paddinglinksrechts - 1, 0, width, height);
    // rect(width / 4 - skalaTextgrösse - 1, 0, 2 * skalaTextgrösse, height / 2); */
  //noStroke();
  // fill(100);
  // rect(width / 3, 0, 3.5 * paddinglinksrechts, 0.7 * paddingobenunten + 1);
  // rect(0, 0, paddinglinksrechts + 1, height);
  /*   rect(
    width / 2 - paddinglinksrechts,
    height - 0.7 * paddingobenunten - 1,
    2 * paddinglinksrechts,
    height
  ); */

  if (millis() - previousTime >= 1) {
    counter += 1; // Increment the counter
    previousTime = millis(); // Update the previous time
  }
  let quarterHourH = valueArray[counter][5];
  stroke(255);
  strokeWeight(ceil(windowWidth / 1500));
  if (quarterHourH != 95) {
    stroke(255);
    //Zürich
    push();
    translate(windowWidth / 4, windowHeight / 2);

    // ellipse(0, 0, windowHeight);
    line(0, 0, valueArray[counter + 1][0], valueArray[counter + 1][1]);
    line(
      valueArray[counter][0],
      valueArray[counter][1],
      valueArray[counter + 1][0],
      valueArray[counter + 1][1]
    );
    pop();
    //Basel
    push();
    translate((windowWidth / 4) * 3, windowHeight / 2);
    line(0, 0, valueArray[counter + 1][2], valueArray[counter + 1][3]);
    line(
      valueArray[counter][2],
      valueArray[counter][3],
      valueArray[counter + 1][2],
      valueArray[counter + 1][3]
    );
    pop();
  }
  noStroke();
  fill(0);
  rect((width / 6) * 2.5, height - jahrpadding - 10, width / 6, height);

  fill(weiss);
  textAlign(CENTER, CENTER);
  textSize(timerTextgrösse);

  text(valueArray[counter][4] + " " + "Uhr", width / 2, height - jahrpadding);
  // text(valueArray[counter][4] + " " + "Uhr", width / 2, height - jahrpadding);
  if (counter > numRows) {
    counter = 0;
  }
}

function draw() {
  //strokeDickeArc = 0.5;

  drawSpiralSkalaZürich();
  drawSpiralSkalaBasel();

  //SpiralStatic();
  strokeDickeArc = 0.1;
  spiralAnim();
}

function drawSpiralSkalaZürich() {
  background(0, 50);

  fill(0);
  rect(0, 0, windowWidth / 4, jahrpadding);
  rect(
    windowWidth - windowWidth / 4,
    height - jahrpadding - 10,
    windowWidth / 2,
    jahrpadding
  );
  textAlign(CENTER, CENTER);
  let zahlenSkala = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
    110,
    120,
    "MWH",
  ];
  let wochentage = [
    "Jan",
    "Feb",
    "März",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ];
  let positions = [];
  let längeGrafik = width - 2 * paddinglinksrechts;
  let einAbschnitt = längeGrafik / 13;
  let mitteAbschnitt = einAbschnitt / 2;

  for (let i = 0; i < 12; i++) {
    push();
    translate(windowWidth / 4, windowHeight / 2);

    let winkelMitternacht = map(i, 0, 12, 0, 360) - 90;
    let winkelwinkelNameTag = map(i, 0, 12, 0, 360) - 75;
    let radius = windowWidth / ringratio - paddinglinksrechts;
    let wochentagRadius = windowWidth / ringratio - paddinglinksrechts;
    let x = radius * cos(winkelMitternacht);
    let y = radius * sin(winkelMitternacht);
    let wochentag = wochentage[i];
    let x2 = wochentagRadius * cos(winkelwinkelNameTag);
    let y2 = wochentagRadius * sin(winkelwinkelNameTag);
    let eineSkalahöheX;
    let eineSkalahöheY;
    let eineSkalahöheX2;
    let eineSkalahöheY2;

    eineSkalahöheX = x / 12;
    eineSkalahöheY = y / 12;
    eineSkalahöheX2 = x2 / 12;
    eineSkalahöheY2 = y2 / 12;

    textSize(skalaTextgrösse);
    noStroke();
    fill(skalaFarbe);
    text(wochentag, 13 * eineSkalahöheX2, 13 * eineSkalahöheY2);

    if (i == 0) {
      noStroke();
      fill(skalaFarbe);
      textSize(skalaTextgrösse);
      text("MWh", 13 * eineSkalahöheX, 13 * eineSkalahöheY);
      // text("MWh", 13 * eineSkalahöheX, 13 * eineSkalahöheY);
      textSize(stadtTextgrösse);
      noStroke();
      fill(weiss);
      text("Zürich", 14.5 * eineSkalahöheX, 14.5 * eineSkalahöheY);

      stroke(skalaFarbe);
      strokeWeight(strokeDickeArc);
      line(
        2.5 * eineSkalahöheX,
        2.5 * eineSkalahöheY,
        3.5 * eineSkalahöheX,
        3.5 * eineSkalahöheY
      );
      line(
        4.5 * eineSkalahöheX,
        4.5 * eineSkalahöheY,
        5.5 * eineSkalahöheX,
        5.5 * eineSkalahöheY
      );
      line(
        6.5 * eineSkalahöheX,
        6.5 * eineSkalahöheY,
        7.5 * eineSkalahöheX,
        7.5 * eineSkalahöheY
      );
      line(
        8.5 * eineSkalahöheX,
        8.5 * eineSkalahöheY,
        9.5 * eineSkalahöheX,
        9.5 * eineSkalahöheY
      );
      line(
        10.5 * eineSkalahöheX,
        10.5 * eineSkalahöheY,
        11.5 * eineSkalahöheX,
        11.5 * eineSkalahöheY
      );
    }

    if (i >= 1) {
      stroke(skalaFarbe);
      strokeWeight(strokeDickeArc);
      line(
        2 * eineSkalahöheX,
        2 * eineSkalahöheY,
        12 * eineSkalahöheX,
        12 * eineSkalahöheY
      );
    }

    /*     if (i == 6) {
            noStroke();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(stadtTextgrösse);
            text("Zürich", 14 * eineSkalahöheX, 14 * eineSkalahöheY);
          } */

    pop();
  }

  for (let i = 0; i <= 13; i++) {
    push();
    translate(width / 4, height / 2);
    //console.log("skala", windowHeight);
    textAlign(CENTER, CENTER);
    let skalaMapping = map(i, 0, 12, 0, windowWidth / 3.5 - paddinglinksrechts);
    let skala = zahlenSkala[i];
    let pos = map(i, 0, 12, 0, windowWidth / 3.5 - paddinglinksrechts);
    positions.push(pos);

    if (i >= 2 && i % 2 == 0) {
      textSize(skalaTextgrösse);
      noStroke();
      fill(skalaFarbe);

      text(skala, 0, -pos);

      noFill();
      strokeWeight(strokeDickeArc);
      stroke(skalaFarbe);
      rotate(-90);
      setLineDash([linedashKoeff, linedashKoeff]);
      //ellipse(0, 0, skalaMapping * 2);
      arc(
        0,
        0,
        skalaMapping * 2,
        skalaMapping * 2,
        12 - i * 0.5,
        348 + i * 0.5,
        OPEN
      );

      /*     noFill();
            strokeWeight(1);
            stroke(100);
            rotate(64);
            setLineDash([linedashKoeff, linedashKoeff]);
            //ellipse(0, 0, skalaMapping * 2);
            arc(0, 0, skalaMapping * 2, skalaMapping * 2, 33, 379, OPEN); */
    }
    pop();
  }
  /*   console.log("titel", titelJahrgrösse);
        console.log("skala", skalaTextgrösse);
        console.log("timer", timerTextgrösse);
        console.log("stadt", stadtTextgrösse); */
  noStroke();
  fill(255);
  textSize(titelJahrgrösse);
  textAlign(CENTER, CENTER);
  text("Stromverbrauch pro Monat", paddinglinksrechts, abstandobenunten);

  textSize(timerTextgrösse);
  text(
    "MWh = Megawattstunden",
    width - paddinglinksrechts,
    height - jahrpadding
  );
  //text("Stromverbrauch pro Woche", windowWidth / 2, abstandobenunten);

  //text("Zürich", windowWidth / 4, 2 * abstandobenunten);
}
function drawSpiralSkalaBasel() {
  textAlign(CENTER, CENTER);
  let zahlenSkala = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
    110,
    120,
    "MWH",
  ];
  let wochentage = [
    "Jan",
    "Feb",
    "März",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ];
  let positions = [];
  let längeGrafik = width - 2 * paddinglinksrechts;
  let einAbschnitt = längeGrafik / 13;
  let mitteAbschnitt = einAbschnitt / 2;

  for (let i = 0; i < 12; i++) {
    push();
    translate((windowWidth / 4) * 3, windowHeight / 2);

    let winkelMitternacht = map(i, 0, 12, 0, 360) - 90;
    let winkelwinkelNameTag = map(i, 0, 12, 0, 360) - 75;
    let radius = windowWidth / ringratio - paddinglinksrechts;
    let wochentagRadius = windowWidth / ringratio - paddinglinksrechts;
    let x = radius * cos(winkelMitternacht);
    let y = radius * sin(winkelMitternacht);
    let wochentag = wochentage[i];
    let x2 = wochentagRadius * cos(winkelwinkelNameTag);
    let y2 = wochentagRadius * sin(winkelwinkelNameTag);
    let eineSkalahöheX;
    let eineSkalahöheY;
    let eineSkalahöheX2;
    let eineSkalahöheY2;

    eineSkalahöheX = x / 12;
    eineSkalahöheY = y / 12;
    eineSkalahöheX2 = x2 / 12;
    eineSkalahöheY2 = y2 / 12;

    textSize(skalaTextgrösse);
    noStroke();
    fill(skalaFarbe);
    text(wochentag, 13 * eineSkalahöheX2, 13 * eineSkalahöheY2);

    if (i == 0) {
      noStroke();
      fill(skalaFarbe);
      textSize(skalaTextgrösse);
      text("MWh", 13 * eineSkalahöheX, 13 * eineSkalahöheY);
      // text("MWh", 13 * eineSkalahöheX, 13 * eineSkalahöheY);
      textSize(stadtTextgrösse);
      noStroke();
      fill(weiss);
      text("Basel", 14.5 * eineSkalahöheX, 14.5 * eineSkalahöheY);

      stroke(skalaFarbe);
      strokeWeight(strokeDickeArc);
      line(
        2.5 * eineSkalahöheX,
        2.5 * eineSkalahöheY,
        3.5 * eineSkalahöheX,
        3.5 * eineSkalahöheY
      );
      line(
        4.5 * eineSkalahöheX,
        4.5 * eineSkalahöheY,
        5.5 * eineSkalahöheX,
        5.5 * eineSkalahöheY
      );
      line(
        6.5 * eineSkalahöheX,
        6.5 * eineSkalahöheY,
        7.5 * eineSkalahöheX,
        7.5 * eineSkalahöheY
      );
      line(
        8.5 * eineSkalahöheX,
        8.5 * eineSkalahöheY,
        9.5 * eineSkalahöheX,
        9.5 * eineSkalahöheY
      );
      line(
        10.5 * eineSkalahöheX,
        10.5 * eineSkalahöheY,
        11.5 * eineSkalahöheX,
        11.5 * eineSkalahöheY
      );
    }

    if (i >= 1) {
      stroke(skalaFarbe);
      strokeWeight(strokeDickeArc);
      line(
        2 * eineSkalahöheX,
        2 * eineSkalahöheY,
        12 * eineSkalahöheX,
        12 * eineSkalahöheY
      );
    }

    /*     if (i == 6) {
            noStroke();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(stadtTextgrösse);
            text("Zürich", 14 * eineSkalahöheX, 14 * eineSkalahöheY);
          } */

    pop();
  }

  for (let i = 0; i <= 13; i++) {
    push();
    translate((width / 4) * 3, height / 2);
    //console.log("skala", windowHeight);
    textAlign(CENTER, CENTER);
    let skalaMapping = map(i, 0, 12, 0, windowWidth / 3.5 - paddinglinksrechts);
    let skala = zahlenSkala[i];
    let pos = map(i, 0, 12, 0, windowWidth / 3.5 - paddinglinksrechts);
    positions.push(pos);

    if (i >= 2 && i % 2 == 0) {
      textSize(skalaTextgrösse);
      noStroke();
      fill(skalaFarbe);

      text(skala, 0, -pos);

      noFill();
      strokeWeight(strokeDickeArc);
      stroke(skalaFarbe);
      rotate(-90);
      setLineDash([linedashKoeff, linedashKoeff]);
      //ellipse(0, 0, skalaMapping * 2);
      arc(
        0,
        0,
        skalaMapping * 2,
        skalaMapping * 2,
        12 - i * 0.5,
        348 + i * 0.5,
        OPEN
      );

      /*     noFill();
            strokeWeight(1);
            stroke(100);
            rotate(64);
            setLineDash([linedashKoeff, linedashKoeff]);
            //ellipse(0, 0, skalaMapping * 2);
            arc(0, 0, skalaMapping * 2, skalaMapping * 2, 33, 379, OPEN); */
    }
    pop();
  }
  /*   console.log("titel", titelJahrgrösse);
        console.log("skala", skalaTextgrösse);
        console.log("timer", timerTextgrösse);
        console.log("stadt", stadtTextgrösse); */
  /*   noStroke();
      fill(255);
      textSize(titelJahrgrösse);
      textAlign(CENTER, CENTER);
      text("Stromverbrauch pro Tag", windowWidth / 2, abstandobenunten); */
  //text("Stromverbrauch pro Woche", windowWidth / 2, abstandobenunten);

  //text("Zürich", windowWidth / 4, 2 * abstandobenunten);
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function quarterHourofTimestamp(timestamp) {
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let quarterHour = Math.floor(minutes / 15);
  let quarterHourOfDay = hours * 4 + quarterHour;
  return quarterHourOfDay;
}

function getWeekday(timestamp) {
  let date = new Date(timestamp);
  let weekday = date.getDay();
  if (weekday === 0) {
    weekday = 6;
  } else {
    weekday--;
  }
  return weekday;
}

function getMonth(timestamp) {
  let date = new Date(timestamp);
  let month = date.getMonth();
  return month;
}

function getHours(timestamp) {
  let date = new Date(timestamp);
  let hour = date.getHours();
  return hour;
}

function getDayOfYear(timestamp) {
  // Create a new Date object from the timestamp
  var date = new Date(timestamp);

  // Get the day of the year (0-indexed)
  var start = new Date(date.getFullYear(), 0, 0);
  var diff = date - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var dayOfYear = Math.floor(diff / oneDay);

  // Add 1 to the day of the year to make it 1-indexed
  return dayOfYear + 1;
}
