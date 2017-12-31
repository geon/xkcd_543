interface BarycentricCoord {
	a: number;
	b: number;
	c: number;
}
interface CartesianCoord {
	x: number;
	y: number;
}
type BarycentricTriangle = Array<BarycentricCoord>;
type CartesianTriangle = Array<CartesianCoord>;
type BezierTriangle = Array<BarycentricCoord>;
type BezierCurve = Array<BarycentricCoord>; // 4 elements
type Path = Array<BezierCurve>;
type TesselatedPath = Array<BarycentricCoord>;

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
	b: BarycentricCoord,
): CartesianCoord {
	return vAdd(
		vsMul(triangle[0], b.a),
		vsMul(triangle[1], b.b),
		vsMul(triangle[2], b.c),
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
		evaluateBezierTriangle(bezierTriangle, { a: 0 / 2, b: 1 / 2, c: 1 / 2 }),
		// Progressively closer to the top corner.
		// Just arbitrary interpolated values picked because they look ok. (Just using 1/3 and 2/3 looks bad.)
		// There's probably a correct mathy way to find the exact spots.
		evaluateBezierTriangle(bezierTriangle, {
			a: 18 / 64,
			b: 23 / 64,
			c: 23 / 64,
		}),
		evaluateBezierTriangle(bezierTriangle, { a: 3 / 5, b: 1 / 5, c: 1 / 5 }),
	];

	var barycentricCoordsOfRightHalfBottom = [
		{ a: 0 / 6, b: 6 / 6, c: 0 / 6 },
		{ a: 0 / 6, b: 5 / 6, c: 1 / 6 },
		{ a: 0 / 6, b: 4 / 6, c: 2 / 6 },
	];

	//    0
	//   8 1
	//  7   2
	// 6 5 4 3

	return {
		left: ([] as BezierTriangle).concat(
			[0, 8, 7].map(function(i) {
				return bezierTriangle[i];
			}),
			barycentricCoordsOfRightHalfBottom
				// Left side winds the opposite way to get the curve on the right side.
				.map(mirrorBarycentric)
				.map(function(b) {
					return evaluateBezierTriangle(bezierTriangle, b);
				}),
			centerLine,
		),
		right: ([] as BezierTriangle).concat(
			[0, 1, 2].map(function(i) {
				return bezierTriangle[i];
			}),
			barycentricCoordsOfRightHalfBottom.map(function(b) {
				return evaluateBezierTriangle(bezierTriangle, b);
			}),
			centerLine,
		),
	};
}

function tesselateSierpinskiHeart(
	baseTriangleCartesian: CartesianTriangle,
	heartInRightHalfBarycentricBezier: Path,
	heartRightUpper: BezierCurve,
	heartRightLower: BezierCurve,
	bezierTriangle: BezierTriangle,
	depth: number,
): Array<TesselatedPath> {
	// Split the heart in left/right halves and draw both.

	var halves = splitBezierTriangle(bezierTriangle);

	return [
		...tesselateHalfSierpinskiHeart(
			baseTriangleCartesian,
			heartInRightHalfBarycentricBezier,
			heartRightUpper,
			heartRightLower,

			halves.left,
			depth,
		),
		...tesselateHalfSierpinskiHeart(
			baseTriangleCartesian,
			heartInRightHalfBarycentricBezier,
			heartRightUpper,
			heartRightLower,

			halves.right,
			depth,
		),
	];
}

function tesselateHalfSierpinskiHeart(
	baseTriangleCartesian: CartesianTriangle,
	heartInRightHalfBarycentricBezier: Path,
	heartRightUpper: BezierCurve,
	heartRightLower: BezierCurve,
	halfBezierTriangle: BezierTriangle,
	depth: number,
): Array<TesselatedPath> {
	let tesselated = [
		tesselatePath(
			heartInRightHalfBarycentricBezier,
			Math.max(1, Math.ceil(depth * 2)),
		),
	];

	if (depth > 1) {
		var heartRightUpperForHalf = heartRightUpper.map(makeRightHalf);
		const fullA = { a: 1, b: 0, c: 0 };
		var topHalfTriangle = [
			fullA,
			interpolateBarycentric(fullA, heartRightUpperForHalf[3], 2 / 3),
			interpolateBarycentric(fullA, heartRightUpperForHalf[3], 1 / 3),
			heartRightUpperForHalf[3],
			heartRightUpperForHalf[2],
			heartRightUpperForHalf[1],
			heartRightUpperForHalf[0],
			interpolateBarycentric(fullA, heartRightUpperForHalf[0], 2 / 3),
			interpolateBarycentric(fullA, heartRightUpperForHalf[0], 1 / 3),
		];

		var heartRightLowerForHalf = heartRightLower.map(makeRightHalf);
		const fullB = { a: 0, b: 1, c: 0 };
		var lowerFullTriangle = [
			heartRightLowerForHalf[0],
			interpolateBarycentric(fullB, heartRightLowerForHalf[0], 2 / 3),
			interpolateBarycentric(fullB, heartRightLowerForHalf[0], 1 / 3),
			fullB,
			interpolateBarycentric(fullB, heartRightLowerForHalf[3], 1 / 3),
			interpolateBarycentric(fullB, heartRightLowerForHalf[3], 2 / 3),
			heartRightLowerForHalf[3],
			heartRightLowerForHalf[2],
			heartRightLowerForHalf[1],
		];

		tesselated = [
			...tesselated,
			...tesselateHalfSierpinskiHeart(
				baseTriangleCartesian,
				heartInRightHalfBarycentricBezier,
				heartRightUpper,
				heartRightLower,

				topHalfTriangle,
				depth - 1,
			),
			...tesselateSierpinskiHeart(
				baseTriangleCartesian,
				heartInRightHalfBarycentricBezier,
				heartRightUpper,
				heartRightLower,

				lowerFullTriangle,
				depth - 1,
			),
		];
	}

	return tesselated.map(tesselatedPath =>
		tesselatedPath.map(coord =>
			evaluateBezierTriangle(halfBezierTriangle, coord),
		),
	);
}

function evaluateBezierCurve(
	bezierCurve: BezierCurve,
	interpolationFactor: number,
) {
	const a = interpolateBarycentric(
		bezierCurve[0],
		bezierCurve[1],
		interpolationFactor,
	);
	const b = interpolateBarycentric(
		bezierCurve[1],
		bezierCurve[2],
		interpolationFactor,
	);
	const c = interpolateBarycentric(
		bezierCurve[2],
		bezierCurve[3],
		interpolationFactor,
	);

	const d = interpolateBarycentric(a, b, interpolationFactor);
	const e = interpolateBarycentric(b, c, interpolationFactor);

	return interpolateBarycentric(d, e, interpolationFactor);
}

function tesselatePath(path: Path, numSegments: number): TesselatedPath {
	const coords = [];
	// let coords = [] as Array<Coord>;
	for (const curve of path) {
		for (let i = 0; i <= numSegments; ++i) {
			coords.push(evaluateBezierCurve(curve, i / numSegments));
		}
	}
	// for (const curve of path) {
	// 	coords = [...coords, ...curve];
	// }

	return coords;
}

function evaluateBezierTriangle(
	bezierTriangle: BezierTriangle,
	b: BarycentricCoord,
) {
	var subTriangles = makeSubTriangles(bezierTriangle);

	return evaluateBarycentricTriangle(
		[
			evaluateBarycentricTriangle(
				[
					evaluateBarycentricTriangle(subTriangles[0], b),
					evaluateBarycentricTriangle(subTriangles[1], b),
					evaluateBarycentricTriangle(subTriangles[5], b),
				],
				b,
			),
			evaluateBarycentricTriangle(
				[
					evaluateBarycentricTriangle(subTriangles[1], b),
					evaluateBarycentricTriangle(subTriangles[2], b),
					evaluateBarycentricTriangle(subTriangles[3], b),
				],
				b,
			),
			evaluateBarycentricTriangle(
				[
					evaluateBarycentricTriangle(subTriangles[5], b),
					evaluateBarycentricTriangle(subTriangles[3], b),
					evaluateBarycentricTriangle(subTriangles[4], b),
				],
				b,
			),
		],
		b,
	);
}

function makeSubTriangles(
	bezierTriangle: BezierTriangle,
): Array<BarycentricTriangle> {
	var center = bAvg(
		bezierTriangle[1],
		bezierTriangle[2],
		bezierTriangle[4],
		bezierTriangle[5],
		bezierTriangle[7],
		bezierTriangle[8],
	);

	return [
		[bezierTriangle[0], bezierTriangle[1], bezierTriangle[8]],
		[bezierTriangle[1], bezierTriangle[2], center],
		[bezierTriangle[2], bezierTriangle[3], bezierTriangle[4]],
		[center, bezierTriangle[4], bezierTriangle[5]],
		[bezierTriangle[7], bezierTriangle[5], bezierTriangle[6]],
		[bezierTriangle[8], center, bezierTriangle[7]],
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
		a:
			triangle[0].a * coord.a +
			triangle[1].a * coord.b +
			triangle[2].a * coord.c,
		b:
			triangle[0].b * coord.a +
			triangle[1].b * coord.b +
			triangle[2].b * coord.c,
		c:
			triangle[0].c * coord.a +
			triangle[1].c * coord.b +
			triangle[2].c * coord.c,
	};
}

function makeRightHalf(coord: BarycentricCoord): BarycentricCoord {
	return { a: coord.a, b: coord.b - coord.c, c: coord.c * 2 };
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
	var baseTriangleCartesian = [
		vAdd(margin, { x: triangleSize.x / 2, y: 0 }),
		vAdd(margin, { x: triangleSize.x, y: triangleSize.y }),
		vAdd(margin, { x: 0, y: triangleSize.y }),
	];

	var heartRightUpper = [
		{ a: 1 / 2, b: 1 / 4, c: 1 / 4 },
		{ a: 13 / 20, b: 5 / 20, c: 2 / 20 },
		{ a: 6 / 10, b: 4 / 10, c: 0 },
		{ a: 1 / 2, b: 1 / 2, c: 0 },
	];

	var heartRightLower = [
		{ a: 1 / 2, b: 1 / 2, c: 0 },
		{ a: 4 / 10, b: 6 / 10, c: 0 },
		{ a: 3 / 16, b: 10 / 16, c: 3 / 16 },
		{ a: 0, b: 1 / 2, c: 1 / 2 },
	];

	// var heartBarycentricBezier = [
	// 	heartRightUpper,
	// 	heartRightLower,
	// 	heartRightLower.map(mirrorBarycentric),
	// 	heartRightUpper.map(mirrorBarycentric),
	// ];

	var heartInRightHalfBarycentricBezier = [
		heartRightUpper.map(makeRightHalf),
		heartRightLower.map(makeRightHalf),
	];

	// var heartInLeftHalfBarycentricBezier = mirrorPath(
	// 	heartInRightHalfBarycentricBezier,
	// );

	var baseBezierTriangle = [
		{ a: 1, b: 0, c: 0 },
		{ a: 2 / 3, b: 1 / 3, c: 0 },
		{ a: 1 / 3, b: 2 / 3, c: 0 },
		{ a: 0, b: 1, c: 0 },
		{ a: 0, b: 2 / 3, c: 1 / 3 },
		{ a: 0, b: 1 / 3, c: 2 / 3 },
		{ a: 0, b: 0, c: 1 },
		{ a: 1 / 3, b: 0, c: 2 / 3 },
		{ a: 2 / 3, b: 0, c: 1 / 3 },
	];

	const tesselated = tesselateSierpinskiHeart(
		baseTriangleCartesian,
		heartInRightHalfBarycentricBezier,
		heartRightUpper,
		heartRightLower,

		baseBezierTriangle,
		7,
	);

	ctx.strokeStyle = "red";
	ctx.lineWidth = lineWidth;
	for (const path of tesselated) {
		ctx.beginPath();
		const coord = coordBarycentricToCartesian(baseTriangleCartesian, path[0]);
		ctx.moveTo(coord.x, coord.y);
		for (const barycentricCoord of path.slice(1)) {
			const coord = coordBarycentricToCartesian(
				baseTriangleCartesian,
				barycentricCoord,
			);
			ctx.lineTo(coord.x, coord.y);
		}
		ctx.stroke();
	}
})();
