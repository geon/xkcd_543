interface BarycentricCoord {
	a: number;
	b: number;
	c: number;
}
interface CartesianCoord {
	x: number;
	y: number;
}
interface Triangle<TCoord> {
	a: TCoord;
	b: TCoord;
	c: TCoord;
}
type BarycentricTriangle = Triangle<BarycentricCoord>;
type CartesianTriangle = Triangle<CartesianCoord>;
interface BezierTriangle {
	a: BarycentricCoord;
	b: BarycentricCoord;
	c: BarycentricCoord;
	d: BarycentricCoord;
	e: BarycentricCoord;
	f: BarycentricCoord;
	g: BarycentricCoord;
	h: BarycentricCoord;
	i: BarycentricCoord;
}
interface BezierCurve {
	a: BarycentricCoord;
	b: BarycentricCoord;
	c: BarycentricCoord;
	d: BarycentricCoord;
}
type Path = Array<BezierCurve>;
interface TesselatedPath {
	points: Array<BarycentricCoord>;
	color: string;
}

const heartTopTouchTriangle: BarycentricCoord = { a: 1 / 2, b: 1 / 2, c: 0 };
const topCorner: BarycentricCoord = { a: 1, b: 0, c: 0 };
const rightCorner: BarycentricCoord = { a: 0, b: 1, c: 0 };
const leftCorner: BarycentricCoord = { a: 0, b: 0, c: 1 };
const heartFold: BarycentricCoord = { a: 1 / 2, b: 1 / 4, c: 1 / 4 };
const bottomMidpoint: BarycentricCoord = { a: 0, b: 1 / 2, c: 1 / 2 };
const heartRightUpper: BezierCurve = {
	a: heartFold,
	b: interpolateBarycentric(
		heartFold,
		interpolateBarycentric(topCorner, rightCorner, 0.3),
		0.5,
	),
	c: interpolateBarycentric(heartTopTouchTriangle, topCorner, 0.15),
	d: heartTopTouchTriangle,
};
const heartRightLower: BezierCurve = {
	a: heartTopTouchTriangle,
	b: interpolateBarycentric(heartTopTouchTriangle, rightCorner, 0.35),
	c: interpolateBarycentric(
		interpolateBarycentric(topCorner, leftCorner, 0.6),
		rightCorner,
		0.45,
	),
	d: bottomMidpoint,
};

const heartInRightHalfBarycentricBezier = [
	makeRightHalfBezierCurve(heartRightUpper),
	makeRightHalfBezierCurve(heartRightLower),
];

function vAdd(...vectors: Array<CartesianCoord>): CartesianCoord {
	var result = { x: 0, y: 0 };

	for (var i = 0; i < vectors.length; i++) {
		result.x += vectors[i].x;
		result.y += vectors[i].y;
	}

	return result;
}

function vSub(a: CartesianCoord, b: CartesianCoord): CartesianCoord {
	return { x: a.x - b.x, y: a.y - b.y };
}

function vsMul(v: CartesianCoord, s: number): CartesianCoord {
	return { x: v.x * s, y: v.y * s };
}

function coordBarycentricToCartesian(
	triangle: CartesianTriangle,
	coord: BarycentricCoord,
): CartesianCoord {
	return vAdd(
		vsMul(triangle.a, coord.a),
		vsMul(triangle.b, coord.b),
		vsMul(triangle.c, coord.c),
	);
}

function mirrorBarycentric(coord: BarycentricCoord): BarycentricCoord {
	return { a: coord.a, b: coord.c, c: coord.b };
}

function splitBezierTriangle(
	bezierTriangle: BezierTriangle,
): { left: BezierTriangle; right: BezierTriangle } {
	var centerLine = [
		// Bottom midpoint.
		evaluateBezierTriangle(bezierTriangle, bottomMidpoint),
		// Progressively closer to the top corner.
		evaluateBezierTriangle(
			bezierTriangle,
			interpolateBarycentric(bottomMidpoint, topCorner, 1 / 3),
		),
		evaluateBezierTriangle(
			bezierTriangle,
			interpolateBarycentric(bottomMidpoint, topCorner, 2 / 3),
		),
	];

	var barycentricCoordsOfRightHalfBottom = [
		{ a: 0 / 6, b: 6 / 6, c: 0 / 6 },
		{ a: 0 / 6, b: 5 / 6, c: 1 / 6 },
		{ a: 0 / 6, b: 4 / 6, c: 2 / 6 },
	];

	const bottomLeftHalf = barycentricCoordsOfRightHalfBottom
		// Left side winds the opposite way to get the curve on the right side.
		.map(mirrorBarycentric)
		.map(function(b) {
			return evaluateBezierTriangle(bezierTriangle, b);
		});

	const bottomRightHalf = barycentricCoordsOfRightHalfBottom.map(function(b) {
		return evaluateBezierTriangle(bezierTriangle, b);
	});

	//    a
	//   i b
	//  h   c
	// g f e d

	return {
		left: {
			a: bezierTriangle.a,
			b: bezierTriangle.i,
			c: bezierTriangle.h,
			d: bottomLeftHalf[0],
			e: bottomLeftHalf[1],
			f: bottomLeftHalf[2],
			g: centerLine[0],
			h: centerLine[1],
			i: centerLine[2],
		},
		right: {
			a: bezierTriangle.a,
			b: bezierTriangle.b,
			c: bezierTriangle.c,
			d: bottomRightHalf[0],
			e: bottomRightHalf[1],
			f: bottomRightHalf[2],
			g: centerLine[0],
			h: centerLine[1],
			i: centerLine[2],
		},
	};
}

function tesselateSierpinskiHeart(
	bezierTriangle: BezierTriangle,
	depth: number,
): Array<TesselatedPath> {
	// Split the heart in left/right halves and draw both.
	var halves = splitBezierTriangle(bezierTriangle);
	const halfHeart = tesselateHalfSierpinskiHeart(depth);
	return [
		...mapTesselatedPathsToBezierTriangle(halfHeart, halves.left),
		...mapTesselatedPathsToBezierTriangle(halfHeart, halves.right),
	];
}

function tesselateHalfSierpinskiHeart(depth: number): Array<TesselatedPath> {
	let tesselated: Array<TesselatedPath> = [
		{
			points: tesselatePath(
				heartInRightHalfBarycentricBezier,
				Math.max(1, Math.ceil(depth * 2)),
			),
			color: depth % 2 ? "red" : "black",
		},
	];

	if (depth > 1) {
		var heartRightUpperForHalf = makeRightHalfBezierCurve(heartRightUpper);
		const fullA = { a: 1, b: 0, c: 0 };
		var topHalfTriangle = {
			a: fullA,
			b: interpolateBarycentric(fullA, heartRightUpperForHalf.d, 2 / 3),
			c: interpolateBarycentric(fullA, heartRightUpperForHalf.d, 1 / 3),
			d: heartRightUpperForHalf.d,
			e: heartRightUpperForHalf.c,
			f: heartRightUpperForHalf.b,
			g: heartRightUpperForHalf.a,
			h: interpolateBarycentric(fullA, heartRightUpperForHalf.a, 2 / 3),
			i: interpolateBarycentric(fullA, heartRightUpperForHalf.a, 1 / 3),
		};

		var heartRightLowerForHalf = makeRightHalfBezierCurve(heartRightLower);
		const fullB = { a: 0, b: 1, c: 0 };
		var lowerFullTriangle = {
			a: heartRightLowerForHalf.a,
			b: interpolateBarycentric(fullB, heartRightLowerForHalf.a, 2 / 3),
			c: interpolateBarycentric(fullB, heartRightLowerForHalf.a, 1 / 3),
			d: fullB,
			e: interpolateBarycentric(fullB, heartRightLowerForHalf.d, 1 / 3),
			f: interpolateBarycentric(fullB, heartRightLowerForHalf.d, 2 / 3),
			g: heartRightLowerForHalf.d,
			h: heartRightLowerForHalf.c,
			i: heartRightLowerForHalf.b,
		};

		tesselated = [
			...mapTesselatedPathsToBezierTriangle(
				tesselateHalfSierpinskiHeart(depth - 1),
				topHalfTriangle,
			),
			...tesselateSierpinskiHeart(lowerFullTriangle, depth - 1),
			...tesselated,
		];
	}

	return tesselated;
}

function mapTesselatedPathsToBezierTriangle(
	tesselatedPaths: Array<TesselatedPath>,
	bezierTriangle: BezierTriangle,
): Array<TesselatedPath> {
	return tesselatedPaths.map(tesselatedPath => ({
		points: tesselatedPath.points.map(coord =>
			evaluateBezierTriangle(bezierTriangle, coord),
		),
		color: tesselatedPath.color,
		depth: tesselatedPath.depth,
	}));
}

function evaluateBezierCurve(
	bezierCurve: BezierCurve,
	interpolationFactor: number,
) {
	const a = interpolateBarycentric(
		bezierCurve.a,
		bezierCurve.b,
		interpolationFactor,
	);
	const b = interpolateBarycentric(
		bezierCurve.b,
		bezierCurve.c,
		interpolationFactor,
	);
	const c = interpolateBarycentric(
		bezierCurve.c,
		bezierCurve.d,
		interpolationFactor,
	);

	const d = interpolateBarycentric(a, b, interpolationFactor);
	const e = interpolateBarycentric(b, c, interpolationFactor);

	return interpolateBarycentric(d, e, interpolationFactor);
}

function tesselatePath(
	path: Path,
	numSegments: number,
): Array<BarycentricCoord> {
	const coords = [];

	for (const curve of path) {
		for (let i = 0; i <= numSegments; ++i) {
			coords.push(evaluateBezierCurve(curve, i / numSegments));
		}
	}

	return coords;
}

function evaluateBezierTriangle(
	bezierTriangle: BezierTriangle,
	coord: BarycentricCoord,
): BarycentricCoord {
	var subTriangles = makeSubTriangles(bezierTriangle);

	return evaluateBarycentricTriangle(
		{
			a: evaluateBarycentricTriangle(
				{
					a: evaluateBarycentricTriangle(subTriangles[0], coord),
					b: evaluateBarycentricTriangle(subTriangles[1], coord),
					c: evaluateBarycentricTriangle(subTriangles[5], coord),
				},
				coord,
			),
			b: evaluateBarycentricTriangle(
				{
					a: evaluateBarycentricTriangle(subTriangles[1], coord),
					b: evaluateBarycentricTriangle(subTriangles[2], coord),
					c: evaluateBarycentricTriangle(subTriangles[3], coord),
				},
				coord,
			),
			c: evaluateBarycentricTriangle(
				{
					a: evaluateBarycentricTriangle(subTriangles[5], coord),
					b: evaluateBarycentricTriangle(subTriangles[3], coord),
					c: evaluateBarycentricTriangle(subTriangles[4], coord),
				},
				coord,
			),
		},
		coord,
	);
}

function makeSubTriangles(
	bezierTriangle: BezierTriangle,
): Array<BarycentricTriangle> {
	var center = bAvg(
		bezierTriangle.b,
		bezierTriangle.c,
		bezierTriangle.e,
		bezierTriangle.f,
		bezierTriangle.h,
		bezierTriangle.i,
	);

	return [
		{ a: bezierTriangle.a, b: bezierTriangle.b, c: bezierTriangle.i },
		{ a: bezierTriangle.b, b: bezierTriangle.c, c: center },
		{ a: bezierTriangle.c, b: bezierTriangle.d, c: bezierTriangle.e },
		{ a: center, b: bezierTriangle.e, c: bezierTriangle.f },
		{ a: bezierTriangle.h, b: bezierTriangle.f, c: bezierTriangle.g },
		{ a: bezierTriangle.i, b: center, c: bezierTriangle.h },
	];
}

function bAvg(...coords: Array<BarycentricCoord>): BarycentricCoord {
	var result = { a: 0, b: 0, c: 0 };

	for (var i = 0; i < coords.length; i++) {
		result.a += coords[i].a;
		result.b += coords[i].b;
		result.c += coords[i].c;
	}

	result.a /= coords.length;
	result.b /= coords.length;
	result.c /= coords.length;

	return result;
}

function evaluateBarycentricTriangle(
	triangle: BarycentricTriangle,
	coord: BarycentricCoord,
): BarycentricCoord {
	return {
		a: triangle.a.a * coord.a + triangle.b.a * coord.b + triangle.c.a * coord.c,
		b: triangle.a.b * coord.a + triangle.b.b * coord.b + triangle.c.b * coord.c,
		c: triangle.a.c * coord.a + triangle.b.c * coord.b + triangle.c.c * coord.c,
	};
}

function makeRightHalf(coord: BarycentricCoord): BarycentricCoord {
	return { a: coord.a, b: coord.b - coord.c, c: coord.c * 2 };
}

function makeRightHalfBezierCurve(curve: BezierCurve): BezierCurve {
	return {
		a: makeRightHalf(curve.a),
		b: makeRightHalf(curve.b),
		c: makeRightHalf(curve.c),
		d: makeRightHalf(curve.d),
	};
}

function interpolateBarycentric(
	coordA: BarycentricCoord,
	coordB: BarycentricCoord,
	factor: number,
): BarycentricCoord {
	return {
		a: coordA.a * (1 - factor) + coordB.a * factor,
		b: coordA.b * (1 - factor) + coordB.b * factor,
		c: coordA.c * (1 - factor) + coordB.c * factor,
	};
}

(function main() {
	var canvas = document.getElementById("canvas") as HTMLCanvasElement;
	var ctx = canvas.getContext("2d")!;

	var pixelDensity = window.devicePixelRatio;
	var lineWidth = 2 * pixelDensity;
	var canvasSize = {
		x: canvas.clientWidth * pixelDensity,
		y: canvas.clientHeight * pixelDensity,
	};
	canvas.setAttribute("width", canvasSize.x + "px");
	canvas.setAttribute("height", canvasSize.y + "px");

	var triangleHeightFactor = Math.sqrt(0.75);
	var triangleSize = {
		x:
			Math.min(canvasSize.x, canvasSize.y / triangleHeightFactor) -
			2 * lineWidth,
		y:
			Math.min(canvasSize.y, canvasSize.x * triangleHeightFactor) -
			2 * lineWidth,
	};
	var margin = vsMul(vSub(canvasSize, triangleSize), 1 / 2);
	var baseTriangleCartesian = {
		a: vAdd(margin, { x: triangleSize.x / 2, y: 0 }),
		b: vAdd(margin, { x: triangleSize.x, y: triangleSize.y }),
		c: vAdd(margin, { x: 0, y: triangleSize.y }),
	};

	var baseBezierTriangle = {
		a: { a: 1, b: 0, c: 0 },
		b: { a: 2 / 3, b: 1 / 3, c: 0 },
		c: { a: 1 / 3, b: 2 / 3, c: 0 },
		d: { a: 0, b: 1, c: 0 },
		e: { a: 0, b: 2 / 3, c: 1 / 3 },
		f: { a: 0, b: 1 / 3, c: 2 / 3 },
		g: { a: 0, b: 0, c: 1 },
		h: { a: 1 / 3, b: 0, c: 2 / 3 },
		i: { a: 2 / 3, b: 0, c: 1 / 3 },
	};

	const tesselated = tesselateSierpinskiHeart(baseBezierTriangle, 7);

	ctx.lineWidth = lineWidth;

	function* draw(): IterableIterator<void> {
		for (const path of tesselated) {
			ctx.beginPath();
			ctx.strokeStyle = path.color;
			const coord = coordBarycentricToCartesian(
				baseTriangleCartesian,
				path.points[0],
			);
			ctx.moveTo(coord.x, coord.y);
			for (const barycentricCoord of path.points.slice(1)) {
				const coord = coordBarycentricToCartesian(
					baseTriangleCartesian,
					barycentricCoord,
				);
				ctx.lineTo(coord.x, coord.y);
			}
			ctx.stroke();
			yield;
		}
	}

	const drawer = draw();

	function loop() {
		const next = drawer.next();
		if (!next.done) {
			requestAnimationFrame(loop);
		}
	}

	loop();
})();
