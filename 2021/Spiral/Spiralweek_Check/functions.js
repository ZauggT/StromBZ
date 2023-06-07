if (isNaN(zurichTempValue)) {
  let prevVal = zurichTempValue[i - 1];
  let nextVal = zurichTempValue[i + 1];
  if (!isNaN(prevVal) && !isNaN(nextVal)) {
    zurichTempValue = (prevVal + nextVal) / 2;
    zurichTempValue[i] = zurichTempValue;
  }
}

/// Timestamp Manipulation
let timestamp = timestampsInData[i];
let date = new Date(timestamp);
let quarterHours = quarterHourofTimestamp(timestamp);
let weekday = getWeekday(timestamp);
let month = getMonth(timestamp);
let dayOfYear = floor(i / 12);
if ((dayOfYear = 0)) {
  dayOfYear = 1;
}

let date = new Date(timestamp);
let day = String(date.getDate()).padStart(2, "0");
let month = String(date.getMonth() + 1).padStart(2, "0");
let year = date.getFullYear();
let dateString = `${day}.${month}.${year}`;

let timeObject = {
  date: date,
  value: value,
  temp: temp,
  quarterHour: quarterHours,
  weekday: weekday,
  month: month,
  dayOfYear: dayOfYear,
};
timeObjects.push(timeObject);

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

// Particles
for (let i = 0; i < partikelAnzahl; i++) {
  allePartikel.push({
    i: i,
    x: random(width),
    y: random(height),
    xAcc: 0,
    yAcc: 0,
  });
}

for (let i = 0; i < allePartikel.length; i++) {
  let theParticle = allePartikel[i];

  if (theParticle.x < 0) {
    theParticle.x = width;
  }
  if (theParticle.x > width) {
    theParticle.x = 0;
  }
  if (theParticle.y < 0) {
    theParticle.y = height;
  }
  if (theParticle.y > height) {
    theParticle.y = 0;
  }

  let exactSectorPos = theParticle.y / (height / anzahlStunden);
  let welcherSektor = Math.floor(exactSectorPos);
  let fraction = exactSectorPos - welcherSektor;
  let velocity1 = valueArray[welcherSektor];
  let velocity2 = valueArray[(welcherSektor + 1) % valueArray.length];
  let interpolatedSpeed = velocity1 + (velocity2 - velocity1) * fraction;
  theParticle.xAcc += 0.4 * interpolatedSpeed;
  theParticle.yAcc += 0;

  let col1 = colorArray[welcherSektor];
  let col2 = colorArray[(welcherSektor + 1) % colorArray.length];
  let interpolateCol = col1 + (col2 - col1) * fraction;
  let StromCol = StromColorScale(interpolateCol);

  ///// Physics Engine /////
  theParticle.y += theParticle.yAcc * 1;
  theParticle.yAcc *= drag;
  theParticle.x += theParticle.xAcc;
  theParticle.xAcc *= drag;
  noStroke();
  fill(StromCol);
  ellipse(theParticle.x, theParticle.y, 6);
}

//// ColorScales ////
let Colorscale = d3.scaleLinear();

// im Setup
Colorscale.domain([-5, 0, 5, 10, 15, 20, 25]).range([
  "#002962",
  "#004E89",
  "#407BA7",
  "#FFFFFF",
  "#FF002B",
  "#C00021",
  "#A0001C",
]);

// im Draw
let color = Colorscale(Wert);

// Interpolation

/// 3D Stuff
/// im Draw
createCanvas(700, 700, WEBGL);
orbitControl();
rotateX(0.5);
rotateY(0.5);
rotateZ(0.5);
background(0);

push();
translate(dx, dy, z);
sphere(3, 6, 6);
pop();

/// Save Imgaes
function keyTyped() {
  if (key === "s" || key === "S") {
    saveCanvas("Radial_3D_Stromverbrauch_Zürich", "jpg");
    print("saving image");
  }
  return false;
}
