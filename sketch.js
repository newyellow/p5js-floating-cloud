
let lineDensity = 0.16;
let dotDensity = 0.9;

let frameNoiseZ = 0;

let MAIN_STYLE = 0;

// bg settings
let bgXRange = 12;
let bgPosNoiseScaleX = 0.12;
let bgPosNoiseScaleY = 0.003;

let bgSizeNoiseScaleX = 0.12;
let bgSizeNoiseScaleY = 0.03;

let bgDotSize = 6;

let bgPosY_A = 0;
let bgPosY_B = 0;
let bgMoveSpeed = 1.6;


let MONDRIAN;
let _bgCanvas;



let paddingOrigin = 30;
let padding = 30;

let edgeThickness = 2;
let cloudShadeLength = 30;

let cloudMoveSpeed = 1;
let cloudMoveRange = 30;

let cloudSetCount = 12;
let cloudsPerSet = 20;

let cloudSets = [];

let _cursor;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  frameRate(60);
  MONDRIAN = color(15, 71, 140);

  // randomize things
  lineDensity = random(0.03, 0.2);
  dotDensity = random(0.2, 2);
  bgDotSize = random(2, 6);
  edgeThickness = random(2, 8);

  cloudSetCount = floor(random(3, 24));
  paddingOrigin = 0.03 * min(width, height);

  if(random() < 0.4)
  {
    MAIN_STYLE = 1;
    cloudShadeLength = random(3, 60);
  }


  // setup bg image
  _bgCanvas = createGraphics(width, height * 2);
  drawBg();
  MONDRIAN.setAlpha(255);

  bgPosX = 0;
  bgPosY_A = 0;
  bgPosY_B = 2 * height;


  // setup clouds
  for (let c = 0; c < cloudSetCount; c++) {
    let xBase = random(0, width);
    let yBase = random(0, height);
    cloudSets[c] = [];

    cloudsPerSet = floor(random(6, 24));

    for (let i = 0; i < cloudsPerSet; i++) {

      let xPos = xBase + random(-0.1, 0.1) * width;
      let yPos = yBase + random(-0.06, 0.06) * height;

      cloudSets[c].push(new Cloud(xPos, yPos));
    }
  }

  _cursor = new CursorObj(width / 2, height / 2);
}

function draw() {
  bgPosY_A = bgPosY_A - bgMoveSpeed;
  bgPosY_B = bgPosY_B - bgMoveSpeed;

  if (bgPosY_A < - 2 * height) {
    bgPosY_A += 4 * height;
  }

  if (bgPosY_B < - 2 * height) {
    bgPosY_B += 4 * height;
  }


  circle(width / 2, bgPosY_A, 10);
  image(_bgCanvas, bgPosX, bgPosY_A);

  circle(width / 2, bgPosY_B, 10);
  image(_bgCanvas, bgPosX, bgPosY_B);

  // draw out frame first
  fill(MONDRIAN);
  padding = paddingOrigin + edgeThickness;
  drawFrame();

  // update cursor
  _cursor.update();

  // draw cloud frames
  for (let c = 0; c < cloudSets.length; c++) {
    for (let i = 0; i < cloudSets[c].length; i++) {
      cloudSets[c][i].update();
      cloudSets[c][i].drawBlueCloud();
    }
  }

  for (let c = 0; c < cloudSets.length; c++) {

    // draw cursor
    if(_cursor.layerIndex == c)
    {
      _cursor.draw();
    }

    // draw white cloud
    for (let i = 0; i < cloudSets[c].length; i++) {
      cloudSets[c][i].drawWhiteCloud();
    }
  }

  fill('white');
  padding = paddingOrigin;
  drawFrame();

  frameNoiseZ += 0.03;

  // bgMoveSpeed = lerp(0.6, 2, noise(bgPosY_A * 0.03));
  bgPosX = sin(radians(frameCount * 3)) * 6;
}

function drawBg() {
  _bgCanvas.background(255);
  // _bgCanvas.blendMode(MULTIPLY);

  let xCount = width * lineDensity;
  let yCount = height * 2 * dotDensity;

  let xStep = width / xCount;
  let yStep = height * 2 / yCount;

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {

      let t = y / (yCount - 1);
      let nx = sin(radians(360 * t)) * width + x * bgPosNoiseScaleX;
      let ny = cos(radians(360 * t)) * height * 2;

      let xPos = x * xStep;
      let yPos = y * yStep;

      let sizeNoise = noise(x * bgSizeNoiseScaleX, ny * bgSizeNoiseScaleY, 123);
      let posNoiseVal = noise(x * bgPosNoiseScaleX, ny * bgPosNoiseScaleY, 600);

      xPos += lerp(-0.5 * bgXRange, 0.5 * bgXRange, posNoiseVal);

      let dotSize = lerp(1, bgDotSize, sizeNoise);

      _bgCanvas.noStroke();
      _bgCanvas.fill(MONDRIAN);
      _bgCanvas.circle(xPos, yPos, dotSize);

    }
  }
}

function drawFrame() {

  let xDotCount = (width - 2 * padding) * dotDensity;
  let xStep = (width - 2 * padding) / xDotCount;

  let yDotCount = (height - 2 * padding) * dotDensity;
  let yStep = (height - 2 * padding) / yDotCount;

  let frameNoiseScaleX = 0.03;
  let frameNoiseScaleY = 0.03;
  let frameDiff = 12;

  // up frame
  beginShape();
  vertex(0, 0);
  vertex(0, padding);

  for (let i = 0; i < xDotCount; i++) {
    let xPos = padding + i * xStep;
    let yPos = padding;

    yPos += noise(xPos * frameNoiseScaleX, yPos * frameNoiseScaleY, frameNoiseZ) * frameDiff - 0.5 * frameDiff;

    let size = noise(xPos * 0.6, yPos * 0.6, frameNoiseZ + 600) * 6;

    vertex(xPos, yPos);
  }

  vertex(width, padding);
  vertex(width, 0);
  endShape();

  // down frame
  beginShape();
  vertex(0, height);
  vertex(0, height - padding);

  for (let i = 0; i < xDotCount; i++) {
    let xPos = padding + i * xStep;
    let yPos = height - padding;

    yPos += noise(xPos * frameNoiseScaleX, yPos * frameNoiseScaleY, frameNoiseZ) * frameDiff - 0.5 * frameDiff;

    let size = noise(xPos * 0.6, yPos * 0.6, frameNoiseZ + 600) * 6;

    vertex(xPos, yPos);
  }
  vertex(width, height - padding);
  vertex(width, height);
  endShape();

  // left frame
  beginShape();
  vertex(0, 0);
  vertex(padding, 0);

  for (let i = 0; i < yDotCount; i++) {
    let xPos = padding;
    let yPos = padding + i * yStep;

    xPos += noise(xPos * frameNoiseScaleX, yPos * frameNoiseScaleY, frameNoiseZ) * frameDiff - 0.5 * frameDiff;

    let size = noise(xPos * 0.6, yPos * 0.6, frameNoiseZ + 600) * 6;

    vertex(xPos, yPos);
  }

  vertex(padding, height);
  vertex(0, height);
  endShape();

  // right frame
  beginShape();
  vertex(width, 0);
  vertex(width - padding, 0);

  for (let i = 0; i < yDotCount; i++) {
    let xPos = width - padding;
    let yPos = padding + i * yStep;

    xPos += noise(xPos * frameNoiseScaleX, yPos * frameNoiseScaleY, frameNoiseZ) * frameDiff - 0.5 * frameDiff;

    let size = noise(xPos * 0.6, yPos * 0.6, frameNoiseZ + 600) * 6;

    vertex(xPos, yPos);
  }

  vertex(width - padding, height);
  vertex(width, height);
  endShape();
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}