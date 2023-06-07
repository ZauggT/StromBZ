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

let numRows;
let previousTime = 0;
let counter = 0;

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

let myFont;
let ellipseSize = 10;

let paddinglinksrechts = 400;
let paddingobenunten = 300;

let jahr = 2022;
let jahrpadding = 150;

function preload() {
  data = loadTable("dataStromTemp15Min.csv", "csv", "header");
}

function setup() {
  createCanvas(3840, 2160); // 3840 x 2160
  background(0);
  myFont = loadFont("Roboto-Thin.ttf");
  textFont(myFont);

  angleMode(DEGREES);

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
    let dateString = `${day}.${month}.${year} ${stunde}`;
    let quarterHours = quarterHourofHour(timestamp);
    let weekday = getWeekday(timestamp);
    weekday = map(weekday, 0, 7, 0, 360) - 90;
    quarterHours = map(quarterHours, 0, 4, 0, 360);
    let winkel = quarterHours;

    let padding = 200;
    let stromZ;
    let stromB;
    let winkelposXZ;
    let winkelposYZ;
    let winkelposXB;
    let winkelposYB;

    if (year == jahr) {
      stromZ = map(
        stromZurich,
        20000,
        120000,
        paddinglinksrechts / 2,
        height / 2 - paddingobenunten
      );
      stromB = map(
        stromBasel,
        20000,
        120000,
        paddinglinksrechts / 2,
        height / 2 - paddingobenunten
      );

      winkelposXZ = stromZ * cos(winkel);
      winkelposYZ = stromZ * sin(winkel);
      winkelposXB = stromB * cos(winkel);
      winkelposYB = stromB * sin(winkel);
      valueArray.push([
        winkelposXZ,
        winkelposYZ,
        winkelposXB,
        winkelposYB,
        dateString,
      ]);
    }
  }
}

function drawSpiralSkalaZürich() {
  background(0, 30);
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

  for (let i = 0; i < 4; i++) {
    push();
    translate(200 + width / 4, height / 2);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(25);
    let winkel = map(i, 0, 4, 0, 360) - 45;
    let winkel2 = map(i, 0, 4, 0, 360) - 65;
    let radius = height / 4;
    let x = radius * cos(winkel);
    let y = radius * sin(winkel);

    let x2 = radius * cos(winkel2);
    let y2 = radius * sin(winkel2);
    //text(tag, x2, y2);

    stroke(255);
    strokeWeight(3);
    line(x / 2, y / 2, x, y);
    rectMode(CENTER);
    rotate(45);
    strokeWeight(5);
    noFill();
    stroke("red");
    rect(0, 0, 800);
    noFill();
    //ellipse(0, 0, 150);
    pop();
  }
}

function drawSpiralStatic() {
  noLoop();
  for (let i = 0; i < valueArray.length / 20 - 1; i++) {
    stroke(255, 10);
    strokeWeight(2);
    //Zürich
    push();
    translate(200 + width / 4, height / 2);
    line(
      valueArray[i][0],
      valueArray[i][1],
      valueArray[i + 1][0],
      valueArray[i + 1][1]
    );
    noStroke();
    fill(255);
    ellipse(0, 0, 5);
    pop();
    //Basel
    push();
    translate(-100 + (width / 4) * 3, height / 2);
    line(
      valueArray[i][2],
      valueArray[i][3],
      valueArray[i + 1][2],
      valueArray[i + 1][3]
    );
    noStroke();
    fill(255);
    ellipse(0, 0, 5);
    pop();
  }

  noStroke();
  fill(0);
  rect(1600, height - 150, 620, 200);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  text(jahr, width / 2, height - 100);
}

function drawSpiral() {
  //translate(width / 2, height / 2);
  //if (frameCount === 1) capturer.start();

  background(0, 30);
  if (millis() - previousTime >= 5) {
    counter++; // Increment the counter
    previousTime = millis(); // Update the previous time
  }

  strokeWeight(20);
  if (counter != 0) {
    stroke(255);
    //Zürich
    push();
    translate(200 + width / 4, height / 2);
    line(
      valueArray[counter - 1][0],
      valueArray[counter - 1][1],
      valueArray[counter][0],
      valueArray[counter][1]
    );
    noStroke();
    fill(255);
    ellipse(0, 0, 5);
    pop();
    //Basel
    push();
    translate(-100 + (width / 4) * 3, height / 2);
    line(
      valueArray[counter - 1][2],
      valueArray[counter - 1][3],
      valueArray[counter][2],
      valueArray[counter][3]
    );
    noStroke();
    fill(255);
    ellipse(0, 0, 5);
    pop();
    /*     noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(50);
    text(valueArray[counter][4], 0, 0); */
  }

  noStroke();
  fill(0);
  rect(1600, height - 150, 620, 200);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  text(valueArray[counter][4] + " " + "Uhr", width / 2, height - 100);

  if (counter == numRows) {
    counter = 0;
  }

  /*   capturer.capture(canvas);
  if (frameCount === 3000) {
    noLoop();
    capturer.stop();
    capturer.save();
  } // 3720 */
}

function draw() {
  drawSpiralStatic();
  drawSpiralSkalaZürich();
  // drawSpiral();
  //drawSkala();

  textSize(72);
  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  text("Zürich", 200, 200);

  textAlign(RIGHT, CENTER);
  text("Basel", width - 200, 200);
}

function drawSkala() {
  background(0, 5);
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
  let monate = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  let positions = [];
  let längeGrafik = width - 2 * paddinglinksrechts;
  let einAbschnitt = längeGrafik / 12;
  let mitteAbschnitt = einAbschnitt / 2;

  textAlign(LEFT, CENTER);

  for (let i = 0; i < monate.length; i++) {
    let tag = monate[i];
    let positionWochentagX = map(
      i,
      0,
      12,
      paddinglinksrechts,
      width - paddinglinksrechts
    );

    if (i < 1 || i > 10) {
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

    if (i % 2 == 0) {
      stroke(linienFarbe);
      strokeWeight(linienDicke);
      line(
        paddinglinksrechts,
        skalaPosY,
        width - paddinglinksrechts,
        skalaPosY
      );
    }

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

  let unterteilungenRaster = 12;

  for (let i = 0; i <= unterteilungenRaster; i++) {
    if (i >= 0 && i <= unterteilungenRaster) {
      let skalaPosX = map(
        i,
        0,
        unterteilungenRaster,
        paddinglinksrechts,
        width - paddinglinksrechts
      );
      stroke(linienFarbe);
      strokeWeight(linienDicke);
      line(skalaPosX, paddingobenunten, skalaPosX, height - paddingobenunten);

      if (i < 2) {
        textAlign(CENTER, CENTER);
        textSize(textgrösseZeitbeschriftung);
        stroke(schriftFarbe);
        strokeWeight(schriftDicke);
        fill(schriftFarbe);
        text("00:00", skalaPosX, height - paddingobenunten + einmittungTime);
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
  text("Stromverbrauch pro Monat", width / 2, abstandobenunten);
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

function quarterHourofHour(timestamp) {
  let date = new Date(timestamp);
  let minutes = date.getMinutes();
  let quarterHour = Math.floor(minutes / 15);
  return quarterHour;
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
