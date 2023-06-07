let unterteilungenRaster = 7;
for (let j = 0; j <= 10; j++) {
  if (j % 2 == 0 || j == 0) {
    for (let i = 0; i <= unterteilungenRaster; i++) {
      if (i >= 0 && i <= 7) {
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
          textSize(30);
          stroke(schriftFarbe);
          strokeWeight(0.5);
          fill(schriftFarbe);
          text("00:00", skalaPosX, height - paddingobenunten + 75);
        }
      }
    }
  }
}
