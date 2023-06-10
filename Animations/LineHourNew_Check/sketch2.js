const capturer = new CCapture({
  framerate: 60,
  format: "webm",
  name: "Line_Hour_Zurich",
  quality: 100,
  verbose: true,
});

let data;
let arrayWithTempValuesZurich = [];
let arrayWithTempValuesBasel = [];
let arrayWithStromValuesBasel = [];
let arrayWithStromValuesZurich = [];
let valueArray;

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

let numRows;

let counter = 0;
let previousTime = 0;

let weekday;
let weekdayRaw;
let paddinglinksrechts;
let paddingobenunten;
let jahrpadding;
let resizeTimer;

let zürichbaselabstand;
let abstandobenunten;
let abstandTag;
let abstandSkala;
let textgrösseTitelYahr;
let textgrösseZBKWH;
let textgrösseTageMonate;
let lineLength;

let skalaFarbe;
let weiss = 255;
let liniendicke;
let titelJahrgrösse;
let stadtTextgrösse;
let skalaTextgrösse;
let timerTextgrösse;

let myFont;

let ratio = 1.77;
let ratioPaddinglinksrechts;
let ratioPaddingobenunten;

let jahr = 2019;

function preload() {
  data = loadTable("dataStromTemp15Min.csv", "csv", "header");
}

function setup() {
  pixelDensity(1);
  valueArray = [];
  createCanvas(windowWidth, windowHeight); //3840 x 2160
  background(0);
  if (windowWidth < windowHeight) {
    ratioPaddinglinksrechts = 12;
    ratioPaddingobenunten = 8;
  }

  if (windowWidth > windowHeight) {
    ratioPaddinglinksrechts = 8;
    ratioPaddingobenunten = 12;
  }

  paddinglinksrechts = windowHeight / ratioPaddinglinksrechts;
  paddingobenunten = windowWidth / ratioPaddingobenunten;
  jahrpadding = paddingobenunten / 2;
  längeGrafik = windowWidth - 2 * paddinglinksrechts;
  einAbschnitt = längeGrafik / 14;

  myFont = loadFont("Roboto-Regular.ttf");
  textFont(myFont);

  zürichbaselabstand = paddinglinksrechts / 2;
  abstandobenunten = paddingobenunten / 3;
  abstandTag = (paddingobenunten / 4) * 3;
  abstandSkala = paddinglinksrechts / 1;
  titelJahrgrösse = floor(windowHeight / 70);
  stadtTextgrösse = floor(windowHeight / 70);
  timerTextgrösse = floor(windowHeight / 90);
  skalaTextgrösse = floor(windowHeight / 90);
  lineLength = ceil(windowHeight / 250);
  skalaFarbe = 100;
  liniendicke = floor(windowHeight / 1500);

  if (liniendicke <= 0) {
    liniendicke = 0.5;
  }

  //console.log(timerTextgrösse);

  if (titelJahrgrösse < 20) {
    titelJahrgrösse = 20;
  }
  if (stadtTextgrösse < 16) {
    stadtTextgrösse = 16;
  }
  if (timerTextgrösse < 16) {
    timerTextgrösse = 16;
  }
  if (skalaTextgrösse < 14) {
    skalaTextgrösse = 14;
  }
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

    //let year = getFullYear(timestamp);

    let date = new Date(timestamp);
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    let stunde = String(date.getHours()).padStart(2, "0");
    let dateString = `${day}.${month}.${year} ${stunde}`;
    let quarterHours = quarterHourofTimestamp(timestamp);
    let quarterHourRaw = quarterHourofTimestamp(timestamp);
    let quarterHourofHours = quarterHourofHour(timestamp);
    weekday = getWeekday(timestamp);
    weekdayRaw = getWeekday(timestamp);
    //let month = getMonth(timestamp);
    let dayOfYear = getDayOfYear(timestamp);

    let posX;
    let posYB;
    let posYZ;

    let posXZurich;
    let posXBasel;
    let posYBasel;
    let posYZurich;

    posX = map(quarterHourofHours, 0, 3, paddinglinksrechts, width / 2);

    posXBasel = map(
      quarterHourofHours,
      0,
      3,
      width / 2 + einAbschnitt,
      width - paddinglinksrechts
    );

    posXZurich = map(
      quarterHourofHours,
      0,
      3,
      paddinglinksrechts,
      width / 2 - einAbschnitt
    );
    posYBasel = map(
      stromBasel,
      20000,
      120000,
      height - paddingobenunten,
      paddingobenunten
    );
    posYZurich = map(
      stromZurich,
      20000,
      120000,
      height - paddingobenunten,
      paddingobenunten
    );
    valueArray.push([
      posXBasel,
      posYBasel,
      posXZurich,
      posYZurich,
      dateString,
      weekdayRaw,
      posX,
      quarterHourofHours,
    ]);
  }

  //
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeAction, 100);
}
function resizeAction() {
  setup();
  redraw();
}

function lineStatic() {
  strokeCap(SQUARE);

  background(0);

  for (let i = 0; i < valueArray.length - 1; i++) {
    let quarterHourH = valueArray[i][5];
    stroke(weiss, 20);
    strokeWeight(ceil(windowWidth / 1500));
    if (quarterHourH != 95) {
      line(
        valueArray[i][2],
        valueArray[i][3],
        valueArray[i + 1][2],
        valueArray[i + 1][3]
      );

      line(
        valueArray[i][0],
        valueArray[i][1],
        valueArray[i + 1][0],
        valueArray[i + 1][1]
      );
    }
  }
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(timerTextgrösse);

  text(jahr, width / 2, height - jahrpadding);
}

function lineAnim() {
  background(0, 30);
  strokeCap(SQUARE);
  fill(0);
  noStroke();
  rect(0, 0, width, paddingobenunten + 1);
  rect(0, 0, paddinglinksrechts + 1, height);
  rect(0, height - paddingobenunten - 1, width, height);
  rect(width - paddinglinksrechts - 1, 0, width, height);

  if (millis() - previousTime >= 1) {
    counter++;
    previousTime = millis();
  }

  let quarterHourH = valueArray[counter][5];

  if (quarterHourH != 95) {
    stroke(weiss);
    strokeWeight(liniendicke);

    line(
      valueArray[counter][0],
      valueArray[counter][1],
      valueArray[counter + 1][0],
      valueArray[counter + 1][1]
    );

    line(
      valueArray[counter][2],
      valueArray[counter][3],
      valueArray[counter + 1][2],
      valueArray[counter + 1][3]
    );
  }

  noStroke();
  fill(weiss);
  textAlign(CENTER, CENTER);
  textSize(timerTextgrösse);
  text(valueArray[counter][4] + " " + "Uhr", width / 2, height - jahrpadding);

  if (counter >= valueArray.length - 1) {
    counter = 0;
  }
  noStroke();
}

function drawStaticGraphic() {}

function draw() {
  //lineStatic();
  lineAnim();
  drawSkala();
}

function drawSkala() {
  // background(0, 20);
  strokeCap(ROUND);
  let schriftFarbe = 255;
  let linienDicke = 0.5;
  let zahlenSkala = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
  let wochentage = [
    "0 '",
    "15 '",
    "30 ''",
    "45 '",
    "0 '",
    "15 '",
    "30 ''",
    "45 '",
  ];
  let positions = [];
  let längeGrafik = width - 2 * paddinglinksrechts;
  let einAbschnitt = längeGrafik / 3;
  let mitteAbschnitt = einAbschnitt / 2;

  textAlign(LEFT, CENTER);

  for (let i = 0; i < wochentage.length; i++) {
    let tag = wochentage[i];
    let positionWochentagX = map(
      i,
      0,
      7,
      paddinglinksrechts,
      width - paddinglinksrechts
    );

    textAlign(CENTER, CENTER);

    textSize(skalaTextgrösse);
    noStroke();
    /*     stroke(schriftFarbe);
      strokeWeight(schriftDicke); */
    fill(skalaFarbe);
    text(tag, positionWochentagX, abstandTag);
    /*     ellipse(
        positionWochentagX + mitteAbschnitt,
        height - paddingobenunten + 1,
        2
      ); */
  }

  for (let i = 0; i <= 11; i++) {
    let skalaPosY = map(i, 0, 10, height - paddingobenunten, paddingobenunten);
    positions.push(skalaPosY);

    if (i % 2 == 0) {
      stroke(255);
      strokeWeight(linienDicke);

      line(
        paddinglinksrechts - lineLength,
        skalaPosY,
        paddinglinksrechts,
        skalaPosY
      );
      line(
        width - paddinglinksrechts + lineLength,
        skalaPosY,
        width - paddinglinksrechts,
        skalaPosY
      );
    }

    if (i % 2 == 0 || i == 0) {
      textAlign(CENTER, CENTER);
      noStroke();
      textSize(skalaTextgrösse);
      /*       stroke(schriftFarbe);
        strokeWeight(schriftDicke); */
      fill(skalaFarbe);
      text(
        zahlenSkala[i],
        width - paddinglinksrechts + 0.5 * abstandSkala,
        skalaPosY
      );
    }
  }

  let unterteilungenRaster = 7;

  for (let i = 0; i <= unterteilungenRaster; i++) {
    let skalaPosX = map(
      i,
      0,
      unterteilungenRaster,
      paddinglinksrechts,
      width - paddinglinksrechts
    );
    stroke(weiss);
    strokeWeight(linienDicke);
    line(skalaPosX, paddingobenunten - lineLength, skalaPosX, paddingobenunten);
    line(
      skalaPosX,
      height - paddingobenunten + lineLength,
      skalaPosX,
      height - paddingobenunten
    );

    /*       if (i < 2) {
          textAlign(CENTER, CENTER);
          textSize(textgrösseZeitbeschriftung);
          stroke(schriftFarbe);
          strokeWeight(schriftDicke);
          fill(schriftFarbe);
          text("00:00", skalaPosX, height - paddingobenunten + einmittungTime);
        } */
  }
  noStroke();
  textSize(skalaTextgrösse);
  fill(skalaFarbe);
  text("MWh", width - paddinglinksrechts + 0.5 * abstandSkala, abstandTag);

  fill(weiss);
  textSize(stadtTextgrösse);
  text(
    "Zürich",
    0 + paddinglinksrechts - 0.5 * abstandSkala,
    (positions[4] + positions[6]) / 2
  );
  textAlign(CENTER, CENTER);
  text(
    "Basel",
    0 + paddinglinksrechts - 0.5 * abstandSkala,
    (positions[0] + positions[2]) / 2
  );

  textSize(titelJahrgrösse);
  textAlign(CENTER, CENTER);
  text("Stromverbrauch pro Stunde", windowWidth / 2, abstandobenunten);
  /*   textAlign(RIGHT, CENTER);
    textSize(timerTextgrösse);
    text(
      "MWh = Megawattstunden",
      width - paddinglinksrechts,
      height - jahrpadding
    ); */
  textAlign(RIGHT, CENTER);
  textSize(timerTextgrösse);
  text(
    "MWh = Megawattstunden",
    width - paddinglinksrechts,
    height - jahrpadding
  );
}

function drawSkala2() {
  let einmittungTime = 40;
  let zürichbaselabstand = 200;
  let abstandobenunten = 100;
  let abstandTag = 250;
  let abstandSkala = 100;
  let textgrösseTitelYahr = 80;
  let textgrösseZBKWH = 50;
  let textgrösseTageMonate = 40;
  let textgrösseZeitbeschriftung = 30;
  let textAbstand = 50;
  let einmittung = 4;
  let schriftFarbe = 255;
  let linienFarbe = 70;
  let schriftDicke = 1;
  let linienDicke = 1;
  let zahlenSkala = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  let wochentage = ["Montag", "Di", "Mi", "Do", "Fr", "Sa", "Sonntag"];
  let positions = [];
  let längeGrafik = width - 2 * paddinglinksrechts;
  let einAbschnitt = längeGrafik / 7;
  let mitteAbschnitt = einAbschnitt / 2;

  textAlign(LEFT, CENTER);

  for (let i = 0; i < wochentage.length; i++) {
    let tag = wochentage[i];
    let positionWochentagX = map(
      i,
      0,
      7,
      paddinglinksrechts,
      width - paddinglinksrechts
    );

    if (i < 1 || i > 5) {
      textAlign(CENTER, CENTER);
      textSize(textgrösseTageMonate);
      stroke(schriftFarbe);
      strokeWeight(schriftDicke);
      fill(schriftFarbe);
      text(tag, positionWochentagX + mitteAbschnitt, abstandTag);
    }
  }
  for (let i = 0; i <= 10; i++) {
    let skalaPosY = map(i, 0, 10, height - paddingobenunten, paddingobenunten);
    positions.push(skalaPosY);

    if (i % 2 == 0 || i == 0) {
      textAlign(CENTER, CENTER);
      textSize(textgrösseZBKWH);
      stroke(schriftFarbe);
      strokeWeight(schriftDicke);
      fill(schriftFarbe);
      text(
        zahlenSkala[i],
        width - paddinglinksrechts + abstandSkala + textAbstand,
        skalaPosY - einmittung
      );
    }
  }
  let unterteilungenRaster = 7;
  for (let j = 0; j <= 10; j++) {
    if (j % 2 == 0 || j == 0) {
      for (let i = 0; i <= unterteilungenRaster; i++) {
        if (i >= 0 && i <= unterteilungenRaster) {
          let skalaPosY = map(
            j,
            0,
            10,
            height - paddingobenunten,
            paddingobenunten
          );
          let skalaPosX = map(
            i,
            0,
            unterteilungenRaster,
            paddinglinksrechts,
            width - paddinglinksrechts
          );
          drawCross(skalaPosX, skalaPosY, 30);

          if (i < 2) {
            textAlign(CENTER, CENTER);
            textSize(textgrösseZeitbeschriftung);
            stroke(schriftFarbe);
            strokeWeight(schriftDicke);
            fill(schriftFarbe);
            text(
              "00:00",
              skalaPosX,
              height - paddingobenunten + einmittungTime
            );
          }
        }
      }
    }
  }

  textSize(textgrösseZBKWH);
  stroke(schriftFarbe);
  strokeWeight(schriftDicke);
  fill(schriftFarbe);
  text(
    "[t" + " " + "kWh]",
    width - paddinglinksrechts + abstandSkala + textAbstand,
    200
  );

  text("Zürich", zürichbaselabstand, (positions[8] + positions[10]) / 2);
  text("Basel", zürichbaselabstand, (positions[0] + positions[2]) / 2);

  textSize(textgrösseTitelYahr);
  stroke(schriftFarbe);
  strokeWeight(schriftDicke);
  fill(schriftFarbe);
  textAlign(CENTER, CENTER);
  text("Stromverbrauch im Wochenzyklus", width / 2, abstandobenunten);
}

function drawCross(x, y, lineLength) {
  // Draw the vertical line
  strokeCap(ROUND);
  stroke(120);
  strokeWeight(2);
  line(x, y - lineLength / 5, x, y + lineLength / 5);

  // Draw the horizontal line
  line(x - lineLength / 1, y, x + lineLength / 1, y);
}

function quarterHourofTimestamp(timestamp) {
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let quarterHour = Math.floor(minutes / 15);
  let quarterHourOfDay = hours * 4 + quarterHour;
  return quarterHourOfDay;
}
function quarterHourofHour(timestamp) {
  let date = new Date(timestamp);
  let minutes = date.getMinutes();
  let quarterHour = Math.floor(minutes / 15);
  return quarterHour;
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

function getFullYear(timestamp) {
  let date = new Date(timestamp);
  let year = date.getFullYear();
  return year;
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
  return dayOfYear - 1;
}
