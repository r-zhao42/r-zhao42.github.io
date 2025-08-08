const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const LINE_GAP = 35
const LINE_END_STEP = LINE_GAP * 35
const LINE_COLOR = "#8f9779"
const LINE_WEIGHT = 1;

class Line {
	constructor(initialX, initialY, initialDx = 0, initialDy = 1, gapLength = LINE_GAP, endStep = LINE_END_STEP, fillStyle = LINE_COLOR) {
		this.x = initialX;
		this.y = initialY;
		this.timeOutId = null;
		this.dx = initialDx;
		this.dy = initialDy;
		this.steps = 1;
		this.gapLength = gapLength;
		this.end = endStep;
		this.fillStyle = fillStyle;
		this.turnCond = (x, y, dx, dy, step, gaplength) => { return x % gapLength == 0 && y % gapLength == 0 && this.steps > 2 * this.gapLength; } // Turn when we hit intersection in grid of size LINE_GAP
		this.getNewDirection = (dx, dy) => {
			let newDx, newDy
			do {
				newDx = Math.floor(Math.random() * 3) - 1;
				newDy = Math.floor(Math.random() * 3) - 1;
			} while (Math.abs(newDx + newDy) == 0)
			return [newDx, newDy]
		}
	}

	animate() {
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x + this.dx, this.y + this.dy);
		ctx.strokeStyle = this.fillStyle;
		ctx.lineWidth = LINE_WEIGHT;
		ctx.stroke();
		this.x += this.dx;
		this.y += this.dy;
		this.steps++
		if (this.turnCond(this.x, this.y, this.dx, this.dy, this.steps, this.gapLength)) {
			[this.dx, this.dy] = this.getNewDirection(this.dx, this.dy);
		}

		if (this.y < canvas.height && this.x < canvas.width && this.steps < this.end) { // Condition to end animation, maybe want to extract into a object property so it can be changed per line
			this.timeOutId = setTimeout(() => { this.animate(); }, 5 + (this.steps / this.end) * 30);
		}
	}
}

window.onresize = setCanvasSize;

canvas.addEventListener("click", (e) => {
	for (let i = 0; i < 4; i++) {
		const lineDx = Math.floor(Math.random() * 3) - 1;
		const lineDy = Math.floor(Math.random() * 3) - 1;

		const newLine = new Line(e.pageX, e.pageY, lineDx, lineDy, LINE_GAP, 5 * LINE_GAP)
		newLine.turnCond = (x, y, dx, dy, step, gapLength) => { return step % gapLength === 0; } // Set different turn condition since depending on start position, may not snap o grid
		newLine.animate();
	}
})

const lines = []
setCanvasSize(null);

function initLines() {
	for (let x = LINE_GAP; x < canvas.width - LINE_GAP; x += LINE_GAP) {
		lines.push(new Line(x, 0));
		lines.push(new Line(x, canvas.height, 0, -1));
	}
	for (let y = LINE_GAP; y < canvas.height - LINE_GAP; y += LINE_GAP) {
		lines.push(new Line(0, y, 1, 0));
		lines.push(new Line(canvas.width, y, -1, 0));
	}
}

function setCanvasSize(e) {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	canvas.width = document.body.scrollWidth;
	canvas.height = document.body.scrollHeight;
	lines.forEach(line => clearTimeout(line.timeOutId));
	lines.length = 0
	initLines();
	lines.forEach(line => {
		line.animate();
	})
}
