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

let myFont;

let ellipseSize = 3;

let jahr = 2022;

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
    let year = date.getFullYear();
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let dayOfYear = getDayOfYear(timestamp);
    let stunde = String(date.getHours()).padStart(2, "0");
    let dateString = `${day}.${month}.${year}`;
    // console.log(dayOfYear);

    let quarterHours = quarterHourofTimestamp(timestamp);
    let weekday = getWeekday(timestamp);
    weekday = map(weekday, 0, 7, 0, 360) - 90;
    quarterHours = map(quarterHours, 0, 96, 0, 360 / 367);
    dayOfYear = map(dayOfYear, 1, 366, 0, 360) - 90;
    let winkel = dayOfYear + quarterHours;

    let realstromZ = stromZurich / 150;
    let realstromB = stromBasel / 150;

    let stromZ;
    let stromB;
    let x;
    let y;
    let x2;
    let y2;

    if (year == jahr) {
      stromZ = map(stromZurich, 20000, 120000, 0, height / 2);
      stromB = map(stromBasel, 20000, 120000, 0, height / 2);
      x = stromZ * cos(winkel);
      y = stromZ * sin(winkel);
      x2 = stromB * cos(winkel);
      y2 = stromB * sin(winkel);
      valueArray.push([x, y, x2, y2, dateString]);
    }
  }
}

function drawSpiralStatic() {
  noLoop();
  strokeCap(SQUARE);
  for (let i = 0; i < valueArray.length - 1; i++) {
    noStroke();
    fill(255);
    //Zürich
    push();
    translate(200 + width / 4, height / 2);

    /*     stroke(255);
    strokeWeight(2);
    line(
      valueArray[i][0],
      valueArray[i][1],
      valueArray[i + 1][0],
      valueArray[i + 1][1]
    ); */

    ellipse(valueArray[i][0], valueArray[i][1], 3);
    //ellipse(0, 0, 5);
    pop();
    //Basel
    push();
    fill(255);
    translate(-100 + (width / 4) * 3, height / 2);
    /*     stroke(255);
    strokeWeight(1);
    line(
      valueArray[i][2],
      valueArray[i][3],
      valueArray[i + 1][2],
      valueArray[i + 1][3]
    ); */
    ellipse(valueArray[i][2], valueArray[i][3], 2);
    //ellipse(0, 0, 5);
    pop();
  }
  noStroke();
  fill(0);
  rect(1500, height - 150, 900, 200);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  text(jahr, width / 2, height - 100);
}
function drawSpiral() {
  //translate(width / 2, height / 2);
  //if (frameCount === 1) capturer.start();

  //background(0);
  if (millis() - previousTime >= 1) {
    counter++; // Increment the counter
    previousTime = millis(); // Update the previous time
  }

  let start = (counter - 1) * 95;
  let end = start + 96;

  for (let i = start; i < end && i < valueArray.length; i++) {
    //Basel
    push();
    noStroke();
    fill(255, 70);
    translate(200 + width / 4, height / 2);
    ellipse(valueArray[i + counter][0], valueArray[i + counter][1], 5);
    pop();
    push();
    noStroke();
    fill(255, 20);
    translate(-100 + (width / 4) * 3, height / 2);

    ellipse(valueArray[i + counter][2], valueArray[i + counter][3], 5);

    pop();
  }

  /*   strokeWeight(5);
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
    translate(-100 + (width / 4) * 3, height / 2);
    line(0, 0, valueArray[counter][2], valueArray[counter][3]);
    line(
      valueArray[counter - 1][2],
      valueArray[counter - 1][3],
      valueArray[counter][2],
      valueArray[counter][3]
    );
    pop();
  } */
  noStroke();
  fill(0);
  rect(1500, height - 150, 900, 200);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  text(valueArray[counter * 95][4], width / 2, height - 100);
  if (counter == numRows) {
    counter = 0;
  }

  /*   capturer.capture(canvas);
  if (frameCount === 3000) {
    noLoop();
    capturer.stop();
    capturer.save();
  } // 3720 */

  //counter++;
}

function draw() {
  drawSpiralStatic();
  //drawSpiral();

  textSize(72);
  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  text("Zürich", 200, 200);

  textAlign(RIGHT, CENTER);
  text("Basel", width - 200, 200);

  for (let i = 0; i < 366; i++) {
    let tag = wochenTage[i];

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(25);
    let winkel = map(i, 0, 366, 0, 360) - 90;
    let winkel2 = map(i, 0, 366, 0, 360) - 65;
    let radius = height / 2;
    let x = radius * cos(winkel);
    let y = radius * sin(winkel);

    let x2 = radius * cos(winkel2);
    let y2 = radius * sin(winkel2);
    //text(tag, x2, y2);

    let lineAnfang = 0;
    let lineEnde = 1.5;

    ellipseGr = 5;

    push();
    translate(200 + width / 4, height / 2);
    noStroke();
    fill(255);
    ellipse(x, y, ellipseGr); //120 KW
    //ellipse(x / 2, y / 2, ellipseGr); // 70 KW
    //line(x / lineAnfang, y / lineAnfang, x / lineEnde, y / lineEnde);
    /*     noFill();
    stroke(100);
    strokeWeight(2);
    ellipse(0, 0, height / 2); */
    ellipse(0, 0, 5);
    pop();

    push();
    translate(-100 + (width / 4) * 3, height / 2);
    noStroke();
    fill(255);
    // ellipse(x / 4, y / 4, ellipseGr); // 30 KW

    ellipse(x / 2, y / 2, ellipseGr); // 70 kw
    ellipse(0, 0, 5);
    /*     noFill();
    stroke(100);
    strokeWeight(2);
    ellipse(0, 0, height / 2); */
    //line(x / lineAnfang, y / lineAnfang, x / lineEnde, y / lineEnde);
    pop();
  }
}

function quarterHourofTimestamp(timestamp) {
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let quarterHour = Math.floor(minutes / 15);
  let quarterHourOfDay = hours * 4 + quarterHour;
  return quarterHourOfDay;
}

function getDayOfMonth(timestamp) {
  let date = new Date(timestamp);
  var day = date.getDate();
  return day;
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
  let date = new Date(timestamp);

  // Get the day of the year (0-indexed)
  let start = new Date(date.getFullYear(), 0, 0);
  let diff = date - start;
  let oneDay = 1000 * 60 * 60 * 24;
  let dayOfYear = Math.floor(diff / oneDay);

  // Add 1 to the day of the year to make it 1-indexed
  return dayOfYear + 1;
}

function getDayOfYear(timestamp) {
  let date = new Date(timestamp);
  let startOfYear = new Date(date.getFullYear(), 0, 0);
  let timeDiff = date - startOfYear;
  let dayOfYear = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return dayOfYear;
}
