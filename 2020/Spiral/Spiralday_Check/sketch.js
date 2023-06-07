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
let previousTime = 0;

let paddinglinksrechts = 400;
let paddingobenunten = 100;

let jahr = 2019;
let jahrpadding = 150;

function preload() {
  data = loadTable("dataStromTemp15Min.csv", "csv", "header");
}

function setup() {
  createCanvas(3840, 2160); // 3840 x 2160
  myFont = loadFont("Roboto-Thin.ttf");
  textFont(myFont);
  background(0);
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
    let quarterHours = quarterHourofTimestamp(timestamp);
    let weekday = getWeekday(timestamp);
    weekday = map(weekday, 0, 7, 0, 360) - 90;
    quarterHours = map(quarterHours, 0, 96, 0, 360) + 90;
    let winkel = quarterHours;

    let stromZ;
    let stromB;
    let x;
    let y;
    let x2;
    let y2;

    if (year == jahr) {
      stromZ = map(stromZurich, 0, 120000, 0, height / 2 - paddingobenunten);
      stromB = map(stromBasel, 0, 120000, 0, height / 2 - paddingobenunten);

      x = stromZ * cos(winkel);
      y = stromZ * sin(winkel);
      x2 = stromB * cos(winkel);
      y2 = stromB * sin(winkel);
      valueArray.push([x, y, x2, y2, dateString]);
    }
  }
}

function drawSpiralSkalaZürich() {
  // background(0);
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
  let zahlenSkala = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
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
    let winkelMitternacht = map(i, 0, 4, 0, 360) - 90;
    let winkelwinkelNameTag = map(i, 0, 4, 0, 360) - 65;
    let radius = height / 2 - paddingobenunten;
    let wochentagRadius = height / 2;
    let x = radius * cos(winkelMitternacht);
    let y = radius * sin(winkelMitternacht);
    let wochentag = wochentage[i];
    let x2 = wochentagRadius * cos(winkelwinkelNameTag);
    let y2 = wochentagRadius * sin(winkelwinkelNameTag);
    if (i == 0 || i == 6) {
      textSize(40);
      strokeWeight(1);
      stroke(255);
      fill(255);
      text(wochentag, x2, y2);
    }
    let eineSkalahöheX = x / 12;
    let eineSkalahöheY = y / 12;
    stroke(255);
    strokeWeight(1);
    line(5 * eineSkalahöheX, 5 * eineSkalahöheY, x, y);
    pop();
  }

  for (let i = 0; i <= 13; i++) {
    push();
    textAlign(CENTER, CENTER);
    let skalaMapping = map(i, 0, 12, 0, height - 2 * paddingobenunten);
    let skala = zahlenSkala[i];
    let pos = map(i, 0, 12, 0, height / 2 - paddingobenunten);
    let rotationSkala = 360 / 7 / 2;
    let rotationArc = -90;
    positions.push(pos);
    translate(200 + width / 4, height / 2);
    if (i > 4 && i < 13) {
      rotate(0);
      textSize(30);
      strokeWeight(1);
      fill(255);
      stroke(255);
      text(skala, 0, pos);
      noFill();
      strokeWeight(1);
      stroke(100);
      rotate(64);
      setLineDash([10, 10]);
      arc(0, 0, skalaMapping, skalaMapping, 33, 379, OPEN);
    }
    pop();
  }
  textAlign(CENTER, CENTER);

  push();
  translate(200 + width / 4, height / 2);
  strokeWeight(1);
  stroke(255);
  fill(255);
  textSize(30);
  text("[ t kWh ]", 0, 350);
  strokeWeight(1);
  stroke(255);
  fill(255);
  textSize(20);
  text("00:00", 0, -380);
  rotate(360 / 7);
  text("00:00", 0, -380);
  pop();
}
function drawSpiralSkalaBasel() {
  //background(0, 30);
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
  let zahlenSkala = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  let wochentage = ["Montag", "Di", "Mi", "Do", "Fr", "Sa", "Sonntag"];
  let positions = [];
  let längeGrafik = width - 2 * paddinglinksrechts;
  let einAbschnitt = längeGrafik / 7;
  let mitteAbschnitt = einAbschnitt / 2;

  for (let i = 0; i < 7; i++) {
    push();
    translate((width / 4) * 3, height / 2);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(25);
    let winkelMitternacht = map(i, 0, 7, 0, 360) - 90;
    let winkelwinkelNameTag = map(i, 0, 7, 0, 360) - 65;
    let radius = height / 2 - paddingobenunten;
    let wochentagRadius = height / 4;
    let x = radius * cos(winkelMitternacht);
    let y = radius * sin(winkelMitternacht);
    let wochentag = wochentage[i];
    let x2 = wochentagRadius * cos(winkelwinkelNameTag);
    let y2 = wochentagRadius * sin(winkelwinkelNameTag);
    /*     if (i == 0 || i == 6) {
      textSize(40);
      strokeWeight(1);
      stroke(255);
      fill(255);
      text(wochentag, x2, y2);
    } */
    let eineSkalahöheX = x / 12;
    let eineSkalahöheY = y / 12;
    stroke(255);
    strokeWeight(1);
    line(
      6 * eineSkalahöheX,
      6 * eineSkalahöheY,
      2 * eineSkalahöheX,
      2 * eineSkalahöheY
    );
    pop();
  }

  for (let i = 2; i <= 6; i++) {
    textAlign(CENTER, CENTER);
    push();
    translate((width / 4) * 3, height / 2);

    let skalaMapping = map(i, 0, 12, 0, height - 2 * paddingobenunten);
    let skala = zahlenSkala[i];
    let pos = map(i, 0, 12, 0, height / 2 - paddingobenunten);
    let rotationSkala = 360 / 7 / 2;
    let rotationArc = -90;
    positions.push(pos);

    rotate(0);
    textSize(30);
    strokeWeight(1);
    fill(255);
    stroke(255);
    text(skala, 0, pos);
    noFill();
    strokeWeight(1);
    stroke(100);
    rotate(64);
    setLineDash([10, 10]);
    arc(0, 0, skalaMapping, skalaMapping, 33, 379, OPEN);

    pop();
  }

  /*   for (let i = 2; i <= 5; i++) {
    let skala = zahlenSkala[i];
    console.log(skala);
    let pos = map(i, 0, 12, 0, height / 2 - paddingobenunten);
    positions.push(pos);
    push();
    translate((width / 4) * 3, height / 2);
    textSize(25);
    fill(255);
    strokeWeight(1);
    stroke(100);
    // rotate(-i * 5.9);
    text(skala, 0, pos);
    pop();
  } */
}
function drawSpiralStatic() {
  strokeCap(SQUARE);
  noLoop();
  for (let i = 0; i < valueArray.length - 1; i++) {
    stroke(255, 25);
    strokeWeight(3);
    //Zürich
    push();
    translate(200 + width / 4, height / 2);
    line(
      valueArray[i][0],
      valueArray[i][1],
      valueArray[i + 1][0],
      valueArray[i + 1][1]
    );
    //ellipse(0, 0, 5);
    pop();
    //Basel
    push();
    translate((width / 4) * 3, height / 2);
    line(
      valueArray[i][2],
      valueArray[i][3],
      valueArray[i + 1][2],
      valueArray[i + 1][3]
    );
    //ellipse(0, 0, 5);
    pop();
  }
  noStroke();
  fill(0);
  rect(0, height - 150, width, 200);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  text(jahr, width / 2, height - 100);
}

function drawSpiral() {
  strokeCap(SQUARE);
  //translate(width / 2, height / 2);
  //if (frameCount === 1) capturer.start();

  background(0, 10);
  if (millis() - previousTime >= 1) {
    counter++; // Increment the counter
    previousTime = millis(); // Update the previous time
  }

  strokeWeight(5);
  if (counter != 0) {
    stroke(255);
    //Zürich
    push();
    translate(200 + width / 4, height / 2);
    line(0, 0, valueArray[counter][0], valueArray[counter][1]);
    line(
      valueArray[counter - 1][0],
      valueArray[counter - 1][1],
      valueArray[counter][0],
      valueArray[counter][1]
    );
    pop();
    //Basel
    push();
    translate((width / 4) * 3, height / 2);
    line(0, 0, valueArray[counter][2], valueArray[counter][3]);
    line(
      valueArray[counter - 1][2],
      valueArray[counter - 1][3],
      valueArray[counter][2],
      valueArray[counter][3]
    );
    pop();
  }

  noStroke();
  fill(0);
  rect(0, height - 150, width, 200);

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
  drawSpiralSkalaBasel();
  //drawSpiral();

  textSize(72);
  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  text("Zürich", 200, 200);

  textAlign(RIGHT, CENTER);
  text("Basel", width - 200, 200);
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
