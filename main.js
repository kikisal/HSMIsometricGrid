const canvas = document.querySelector('canvas');
const aspectRatio = 2;
let scale = 1;
const width = window.innerWidth;
const height = window.innerHeight;



canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

let imgData = ctx.createImageData(width, height);

function setPixel(x, y, color, opacity) {
	const i = (x+y*ctx.canvas.width)*4;
	
	if ( x < 0 || y < 0 || x >= ctx.canvas.width || y >= ctx.canvas.height )
		return;
		
	
	if (!color) {
		imgData.data[i] = 0xFF;
		imgData.data[i+1] = 0xFF;
		imgData.data[i+2] = 0xFF;
		imgData.data[i+3] = 0xFF;
	} else {
	
		if (typeof opacity == 'undefined')
			opacity = 1;
	
		imgData.data[i] = (color >> 16) & 0xFF;
		imgData.data[i+1] = (color >> 8) & 0xFF;
		imgData.data[i+2] = (color >> 0) & 0xFF;
		imgData.data[i+3] = opacity * 0xFF;
	}
}

function line(x0, y0, x1, y1, color, opacity) {
	x0 = Math.floor(x0);
	y0 = Math.floor(y0);
	x1 = Math.floor(x1);
	y1 = Math.floor(y1);
	
	var dx = Math.abs(x1 - x0);
	var dy = Math.abs(y1 - y0);
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx - dy;

	while(true) {

	  setPixel(x0, y0, color, opacity); // Do what you need to for this

	  if ((x0 === x1) && (y0 === y1)) 
	  	break;
	  if (Math.abs(x0 - x1) < 0.0001 && Math.abs(y0 - y1) < 0.0001) 
	  	break;

	  var e2 = 2*err;
	  if (e2 > -dy) { err -= dy; x0  += sx; }
	  if (e2 < dx) { err += dx; y0  += sy; }
	}
}

const offsetOrigin = {
	x: Math.floor(canvas.width /2 - 200),
	y: Math.floor(canvas.height/2 - 100)
};

let origin = {
	x: 0,
	y: 0
};


let endPoint = {
	x: 0,
	y: 0
};

function fill(destX, destY, w, h, color, opacity) {
	for ( let i = 0; i < w; ++i ) {
		for ( let j = 0; j < h; ++j ) {
			
			const i_t = Math.floor(j + i);
			const j_t = Math.floor(.5 * (j - i));
			
			setPixel(i_t + Math.floor(destX), j_t + Math.floor(destY), color, opacity);
		}
	}
}

// fill_2 with left filling area matrix transformation
function fill_2(destX, destY, w, h, color, opacity) {
	for ( let i = 0; i < w; ++i ) {
		for ( let j = 0; j < h*2; ++j ) {
			
			const i_t = i;
			const j_t = Math.floor((j + i)/2);
			
			setPixel(i_t + Math.floor(destX), j_t + Math.floor(destY), color, opacity);
		}
	}
}


// fill_3 with right filling area matrix transformation
function fill_3(destX, destY, w, h, color, opacity) {
	for ( let i = 0; i < w; ++i ) {
		for ( let j = 0; j < h*2; ++j ) {
			
			const i_t = i;
			const j_t = Math.floor((j - i)/2);
			
			setPixel(i_t + Math.floor(destX), j_t + Math.floor(destY), color, opacity);
		}
	}
}

function moveTo(x, y) {
	origin.x = x;
	origin.y = y;
}

function lineTo(x, y, color, opacity) {
	line( origin.x + endPoint.x, origin.y + endPoint.y, origin.x + x, origin.y + y, color, opacity);
	endPoint = {x: x, y: y};
}

function endLine() {
	endPoint.x = 0;
	endPoint.y = 0;
}

const TILE_COLOR = 0xFFFFFF;
const TILE_SIZE = 36;
const GRID_TILE_SIZE = TILE_SIZE * scale;
const thickness = 1.3;
const factorThickness = .20;

const leftLineVertices = [
	0, GRID_TILE_SIZE, 0
];

const rightLineVertices = [
	GRID_TILE_SIZE, 0, 0
];


// default thickness GRID_TILE_SIZE / 4
const floorVerticalLineVertices = [
	0, 0, GRID_TILE_SIZE/5 * thickness
];

function leftLine(gridX, gridY, gridZ, color, opacity) {
	
	color = 0xFFFFFF;
	opacity = .8;
	
	gridX *= GRID_TILE_SIZE;
	gridY *= GRID_TILE_SIZE;
	gridZ *= GRID_TILE_SIZE;

	gridXT = gridX + gridY;
	gridYT = .5 * (gridY - gridX);	
	

	for ( let i = 0; i < leftLineVertices.length; i += 3 ) {	
		const x = leftLineVertices[i];
		const y = leftLineVertices[i + 1];
		const z = leftLineVertices[i + 2];

		// matrix projection.
		let x_t = x + y;
		let y_t = .5 * (y - x);
		

		moveTo(gridXT*scale + offsetOrigin.x, gridYT*scale + offsetOrigin.y + gridZ);
		lineTo(x_t*scale, y_t*scale + z, color, opacity);
		
	}
	
	endLine();
}

function floorVerticalLine(gridX, gridY, gridZ) {	
	gridX *= GRID_TILE_SIZE;
	gridY *= GRID_TILE_SIZE;
	gridZ *= GRID_TILE_SIZE;

	gridXT = gridX + gridY;
	gridYT = .5 * (gridY - gridX);	
	

	for ( let i = 0; i < floorVerticalLineVertices.length; i += 3 ) {
		
		const x = floorVerticalLineVertices[i];
		const y = floorVerticalLineVertices[i + 1];
		const z = floorVerticalLineVertices[i + 2];

		// matrix projection.
		let x_t = x + y;
		let y_t = .5 * (y - x);
		

		moveTo(gridXT*scale + offsetOrigin.x, gridYT*scale + offsetOrigin.y + gridZ);
		lineTo(x_t*scale, y_t*scale + z);
		
	}
	
	endLine();
}


function rightLine(gridX, gridY, gridZ, color, opacity) {
	gridX *= GRID_TILE_SIZE;
	gridY *= GRID_TILE_SIZE;
	gridZ *= GRID_TILE_SIZE;
	
	gridXT = gridX + gridY;
	gridYT = .5 * (gridY - gridX);	
	

	for ( let i = 0; i < rightLineVertices.length; i += 3 ) {
		
		const x = rightLineVertices[i];
		const y = rightLineVertices[i + 1];
		const z = rightLineVertices[i + 2];

		// matrix projection.
		let x_t = x + y;
		let y_t = .5 * (y - x);
		
		
		moveTo(gridXT*scale + offsetOrigin.x, gridYT*scale + offsetOrigin.y + gridZ);
		lineTo(x_t*scale, y_t*scale + z, color, opacity);
	}
	
	endLine();
}

function setTile(gridX, gridY, gridZ, color, opacity) {
	gridX *= GRID_TILE_SIZE;
	gridY *= GRID_TILE_SIZE;
	gridZ *= GRID_TILE_SIZE;
	
	gridXT = gridX + gridY;
	gridYT = .5 * (gridY - gridX);
	
	fill((gridXT*scale) + offsetOrigin.x, (gridYT*scale) + offsetOrigin.y + gridZ, (TILE_SIZE*scale*scale) + 1, TILE_SIZE*scale*scale + 1, color, opacity);
}

function setLeftTile(gridX, gridY, gridZ, color, opacity) {
	
	color = 0xFFFFFF;
	opacity = .8;
	
	gridX *= GRID_TILE_SIZE;
	gridY *= GRID_TILE_SIZE;
	gridZ *= GRID_TILE_SIZE;
	
	gridXT = gridX + gridY;
	gridYT = .5 * (gridY - gridX);
	
	fill_2((gridXT*scale) + offsetOrigin.x, (gridYT*scale) + offsetOrigin.y + gridZ, (TILE_SIZE*scale*scale) + 1, (TILE_SIZE/6*thickness)*scale*scale + 1, color, opacity);
}

function setRightTile(gridX, gridY, gridZ, color, opacity) {
	
	gridX *= GRID_TILE_SIZE;
	gridY *= GRID_TILE_SIZE;
	gridZ *= GRID_TILE_SIZE;
	
	gridXT = gridX + gridY;
	gridYT = .5 * (gridY - gridX);
	
	fill_3((gridXT*scale) + offsetOrigin.x, (gridYT*scale) + offsetOrigin.y + gridZ, (TILE_SIZE*scale*scale) + 1, (TILE_SIZE/5.9*thickness)*scale*scale + 1, color, opacity);
}


function generateFloor() {
	/* door spawn */
	leftLine(0, 0, 0);
	rightLine(0, 0, 0);
	leftLine(1, 0, 0);
	setLeftTile(0, 0, 0);	
	
	rightLine(-1, 1, 0);
	rightLine(-2, 1, 0);
	rightLine(-3, 1, 0);
	rightLine(-4, 1, 0);

	floorVerticalLine(-4, 1, 0);
	setLeftTile(-4, 1, 0);
	setLeftTile(-4, 2, 0);
	setLeftTile(-4, 3, 0);
	setLeftTile(-4, 4, 0);
	setLeftTile(-4, 5, 0);

	
	leftLine(-4, 1, 0);
	leftLine(-4, 2, 0);
	leftLine(-4, 3, 0);
	leftLine(-4, 4, 0);
	leftLine(-4, 5, 0);
	floorVerticalLine(-4, 6, 0);
	
	
	setRightTile(-4, 6, 0, 0xFFFFFF, .5);
	setRightTile(-3, 6, 0, 0xFFFFFF, .5);
	setRightTile(-2, 6, 0, 0xFFFFFF, .5);
	setRightTile(-1, 6, 0, 0xFFFFFF, .5);
	setRightTile(0, 6, 0, 0xFFFFFF, .5);
	setRightTile(1, 6, 0, 0xFFFFFF, .5);
	setRightTile(2, 6, 0, 0xFFFFFF, .5);
	setRightTile(3, 6, 0, 0xFFFFFF, .5);
	setRightTile(4, 6, 0, 0xFFFFFF, .5);

	
	rightLine(-4, 6, 0);
	rightLine(-3, 6, 0);
	rightLine(-2, 6, 0);
	rightLine(-1, 6, 0);
	rightLine(0, 6, 0);
	rightLine(1, 6, 0);
	rightLine(2, 6, 0);
	rightLine(3, 6, 0);
	rightLine(4, 6, 0);
	
	
	leftLine(5, 5, 0);
	leftLine(5, 4, 0);
	leftLine(5, 3, 0);
	leftLine(5, 2, 0);
	leftLine(5, 1, 0);
	rightLine(4, 1, 0);
	rightLine(3, 1, 0);
	rightLine(2, 1, 0);
	rightLine(1, 1, 0);
	
	leftLine(-4, 1, factorThickness * thickness);
	leftLine(-4, 2, factorThickness * thickness);
	leftLine(-4, 3, factorThickness * thickness);
	leftLine(-4, 4, factorThickness * thickness);
	leftLine(-4, 5, factorThickness * thickness);
	
	
	rightLine(-4, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(-3, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(-2, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(-1, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(0, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(1, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(2, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(3, 6, factorThickness * thickness, 0xFFFFFF, .5);
	rightLine(4, 6, factorThickness * thickness, 0xFFFFFF, .5);
	
	
	setTile(0, 0, 0, TILE_COLOR);
	for ( let i = 0; i < 6; ++i ) {
		setTile(0, i, 0, TILE_COLOR);
	}
	setTile(1, 1, 0, TILE_COLOR);
	setTile(1, 1, 0, TILE_COLOR);
	setTile(2, 1, 0, TILE_COLOR);
	setTile(3, 1, 0, TILE_COLOR);
	setTile(4, 1, 0, TILE_COLOR);
	setTile(4, 2, 0, TILE_COLOR);
	setTile(3, 2, 0, TILE_COLOR);
	setTile(2, 2, 0, TILE_COLOR);
	setTile(1, 2, 0, TILE_COLOR);
	setTile(1, 3, 0, TILE_COLOR);
	setTile(2, 3, 0, TILE_COLOR);
	setTile(3, 3, 0, TILE_COLOR);
	setTile(4, 3, 0, TILE_COLOR);
	setTile(4, 4, 0, TILE_COLOR);
	setTile(3, 4, 0, TILE_COLOR);
	setTile(2, 4, 0, TILE_COLOR);
	setTile(1, 4, 0, TILE_COLOR);
	setTile(1, 5, 0, TILE_COLOR);
	setTile(2, 5, 0, TILE_COLOR);
	setTile(3, 5, 0, TILE_COLOR);
	setTile(4, 5, 0, TILE_COLOR);
	setTile(-1, 1, 0, TILE_COLOR);
	setTile(-1, 1, 0, TILE_COLOR);
	setTile(-2, 1, 0, TILE_COLOR);
	setTile(-3, 1, 0, TILE_COLOR);
	setTile(-4, 1, 0, TILE_COLOR);
	setTile(-4, 2, 0, TILE_COLOR);
	setTile(-3, 2, 0, TILE_COLOR);
	setTile(-2, 2, 0, TILE_COLOR);
	setTile(-1, 2, 0, TILE_COLOR);
	setTile(-1, 3, 0, TILE_COLOR);
	setTile(-2, 3, 0, TILE_COLOR);
	setTile(-3, 3, 0, TILE_COLOR);
	setTile(-4, 3, 0, TILE_COLOR);
	setTile(-4, 4, 0, TILE_COLOR);
	setTile(-4, 4, 0, TILE_COLOR);
	setTile(-3, 4, 0, TILE_COLOR);
	setTile(-2, 4, 0, TILE_COLOR);
	setTile(-1, 4, 0, TILE_COLOR);
	setTile(-1, 5, 0, TILE_COLOR);
	setTile(-2, 5, 0, TILE_COLOR);
	setTile(-3, 5, 0, TILE_COLOR);
	setTile(-4, 5, 0, TILE_COLOR);

}

generateFloor();

ctx.putImageData(imgData, 0, 0);

