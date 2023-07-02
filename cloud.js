class Cloud {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;

        this.nowX = this.x;
        this.nowY = this.y;

        this.radiusX = random(0.03, 0.12) * min(width, height);
        this.radiusY = random(0.1, 0.8) * this.radiusX;

        this.steps = 100;
        this.noiseX = random(-100000, 100000);
        this.noiseY = random(-100000, 100000);
        this.noiseScaleX = random(0.001, 0.01);
        this.noiseScaleY = random(0.001, 0.01);

        this.noiseAdd = 1;

        this.nowDegree = random(0, 360);
        this.moveSpeed = cloudMoveSpeed;
        this.moveDist = cloudMoveRange;

        // this.noiseDiff = random(0.05, 0.3) * this.radius;
        this.noiseDiff = random(20, 60);

        this.points = [];
        for (let i = 0; i < this.steps; i++) {
            let t = i / this.steps;

            let x = sin(radians(360 * t)) * this.radiusX;
            let y = -cos(radians(360 * t)) * this.radiusY;

            this.points[i] = { px: x, py: y };
        }

    }

    update() {
        this.noiseX += this.noiseAdd;
        this.noiseY += this.noiseAdd;

        this.nowDegree = (this.nowDegree + this.moveSpeed) % 360;
        this.nowY = this.y + sin(radians(this.nowDegree)) * this.moveDist;
    }

    drawWhiteCloud() {
        if (MAIN_STYLE == 0)
            this.draw(color('white'), -1 * edgeThickness);
        else
            this.draw(color('white'), -1 * edgeThickness, true);
    }

    drawBlueCloud() {
        this.draw(MONDRIAN, edgeThickness);
    }

    draw(_color, _distAdd, _drawShadeLines = false) {

        noStroke();
        fill(_color);

        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            let t = i / this.points.length;

            let x = this.nowX + this.points[i].px;
            let y = this.nowY + this.points[i].py;

            let noiseValue = noise((this.noiseX + x) * this.noiseScaleX, (this.noiseY + y) * this.noiseScaleY);

            x += sin(radians(360 * t)) * noiseValue * (this.noiseDiff);
            y -= cos(radians(360 * t)) * noiseValue * (this.noiseDiff);

            if (_distAdd != 0) {
                let addNoise = noise((this.noiseX + x) * 0.03 + 6000, (this.noiseY + y) * 0.03);
                x += sin(radians(360 * t)) * addNoise * _distAdd;
                y -= cos(radians(360 * t)) * addNoise * _distAdd;
            }

            vertex(x, y);
            if (_drawShadeLines) {
                stroke(MONDRIAN);

                let shadeNoise = noise((this.noiseX + x) * 0.008 + 6000, (this.noiseY + y) * 0.03);

                if (t > 0.25 && t < 0.75)
                    line(x, y, x, y + cloudShadeLength * shadeNoise);
                else
                    line(x, y, x, y - cloudShadeLength * shadeNoise);
            }
        }
        noStroke();
        endShape(CLOSE);
    }
}



class CursorObj {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;

        this.layerIndex = 0;

        this.thickness = edgeThickness;
        this.edgeLength = min(width, height) * 0.06;

        this.moveDir = 0;
        this.moveSpeed = 20;
        this.baseSpeed = [0, 20];

        this.noiseX = random(-100000, 100000);
        this.speedNoiseX = random(-100000, 100000);
    }


    update() {
        if (this.x < -0.2 * width) {
            this.x += 1.4 * width;
            this.randomSpeed();
        }
        else if (this.x > 1.2 * width) {
            this.x -= 1.4 * width;
            this.randomSpeed();
        }

        if (this.y < -0.2 * height) {
            this.y += 1.4 * height;
            this.randomSpeed();
        }
        else if (this.y > 1.2 * height) {
            this.y -= 1.4 * height;
            this.randomSpeed();
        }

        this.x += sin(radians(this.moveDir)) * this.moveSpeed;
        this.y -= cos(radians(this.moveDir)) * this.moveSpeed;

        this.moveDir += noise((this.noiseX + this.x) * 0.003, this.y * 0.002) * 20 - 10;

        let moveNoise = noise(this.speedNoiseX);
        this.moveSpeed = lerp(this.baseSpeed[0], this.baseSpeed[1], moveNoise);
        this.speedNoiseX += 0.06;
    }

    randomSpeed() {
        this.baseSpeed[0] = random(2, 12);
        this.baseSpeed[1] = random(20, 60);

        this.layerIndex = floor(random(0, cloudSetCount));
    }

    draw() {
        strokeCap(SQUARE);

        push();
        translate(this.x, this.y);

        strokeWeight(this.thickness);
        stroke(MONDRIAN);
        fill('white');

        beginShape();
        vertex(0, 0);
        vertex(0, this.edgeLength);
        vertex(0.25 * this.edgeLength, 0.75 * this.edgeLength);
        vertex(0.4 * this.edgeLength, 1.08 * this.edgeLength);
        vertex(0.56 * this.edgeLength, 0.98 * this.edgeLength);
        vertex(0.41 * this.edgeLength, 0.68 * this.edgeLength);
        vertex(0.72 * this.edgeLength, 0.64 * this.edgeLength);
        endShape(CLOSE);

        pop();
    }
}