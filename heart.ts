type Coord = Array<number>; // 3 elements for barycentric.
type Triangle = Array<Coord>;
type BezierCurve = Array<Coord>; // 4 elements
type Path = Array<BezierCurve>;

function vAdd(...vectors: Array<Coord>) {
	var result = [0, 0];

	for (var i = 0; i < vectors.length; i++) {
		result[0] += vectors[i][0];
		result[1] += vectors[i][1];
	}

	return result;
}

function vSub(a: Coord, b: Coord) {
	return [a[0] - b[0], a[1] - b[1]];
}

function vsMul(v: Coord, s: number) {
	return [v[0] * s, v[1] * s];
}

function coordBarycentricToCartesian(triangle: Triangle, b: Coord) {
	return vAdd(
		vsMul(triangle[0], b[0]),
		vsMul(triangle[1], b[1]),
		vsMul(triangle[2], b[2]),
	);
}

function pathBarycentricToCartesian(triangle: Triangle, path: Path) {
	return path.map(function(bezier) {
		return bezier.map(function(b) {
			return coordBarycentricToCartesian(triangle, b);
		});
	});
}

function flatten<T>(arrayOfArrays: Array<Array<T>>): Array<T> {
	return arrayOfArrays.reduce(function(soFar, current) {
		return soFar.concat(current);
	}, []);
}

function mirrorBarycentric(b: Coord) {
	return [b[0], b[2], b[1]];
}

function splitBezierTriangle(bezierTriangle: Triangle) {
	var centerLine = [
		// Bottom midpoint.
		evaluateBezierTriangle(bezierTriangle, [0 / 2, 1 / 2, 1 / 2]),
		// Progressively closer to the top corner.
		// Just arbitrary interpolated values picked because they look ok. (Just using 1/3 and 2/3 looks bad.)
		// There's probably a correct mathy way to find the exact spots.
		evaluateBezierTriangle(bezierTriangle, [18 / 64, 23 / 64, 23 / 64]),
		evaluateBezierTriangle(bezierTriangle, [3 / 5, 1 / 5, 1 / 5]),
	];

	var barycentricCoordsOfRightHalfBottom = [
		[0 / 6, 6 / 6, 0 / 6],
		[0 / 6, 5 / 6, 1 / 6],
		[0 / 6, 4 / 6, 2 / 6],
	];

	//    0
	//   8 1
	//  7   2
	// 6 5 4 3

	return {
		left: ([] as Array<Array<number>>).concat(
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
		right: ([] as Array<Array<number>>).concat(
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

function mirrorPath(path: Path) {
	return path.map(function(segment) {
		return segment.map(mirrorBarycentric);
	});
}

function drawSierpinskiHeart(
	ctx: CanvasRenderingContext2D,
	lineWidth: number,
	baseTriangleCartesian: Triangle,
	heartInRightHalfBarycentricBezier: Path,
	heartRightUpper: BezierCurve,
	heartRightLower: BezierCurve,
	bezierTriangle: Triangle,
	depth: number,
) {
	// Split the heart in left/right halves and draw both.

	var halves = splitBezierTriangle(bezierTriangle);

	drawHalfSierpinskiHeart(
		ctx,
		lineWidth,
		baseTriangleCartesian,
		heartInRightHalfBarycentricBezier,
		heartRightUpper,
		heartRightLower,

		halves.left,
		depth,
	);
	drawHalfSierpinskiHeart(
		ctx,
		lineWidth,
		baseTriangleCartesian,
		heartInRightHalfBarycentricBezier,
		heartRightUpper,
		heartRightLower,

		halves.right,
		depth,
	);
}

function drawHalfSierpinskiHeart(
	ctx: CanvasRenderingContext2D,
	lineWidth: number,
	baseTriangleCartesian: Triangle,
	heartInRightHalfBarycentricBezier: Path,
	heartRightUpper: BezierCurve,
	heartRightLower: BezierCurve,
	halfBezierTriangle: Triangle,
	depth: number,
) {
	drawPath(
		ctx,
		lineWidth,
		baseTriangleCartesian,
		transformPathByBezierTriangle(
			halfBezierTriangle,
			heartInRightHalfBarycentricBezier,
		),
	);

	if (depth > 1) {
		var heartRightUpperForHalf = heartRightUpper.map(makeRightHalf);
		var topHalfTriangle = [
			[1, 0, 0],
			interpolateBarycentric([1, 0, 0], heartRightUpperForHalf[3], 2 / 3),
			interpolateBarycentric([1, 0, 0], heartRightUpperForHalf[3], 1 / 3),
			heartRightUpperForHalf[3],
			heartRightUpperForHalf[2],
			heartRightUpperForHalf[1],
			heartRightUpperForHalf[0],
			interpolateBarycentric([1, 0, 0], heartRightUpperForHalf[0], 2 / 3),
			interpolateBarycentric([1, 0, 0], heartRightUpperForHalf[0], 1 / 3),
		];
		drawHalfSierpinskiHeart(
			ctx,
			lineWidth,
			baseTriangleCartesian,
			heartInRightHalfBarycentricBezier,
			heartRightUpper,
			heartRightLower,

			transformBezierTriangleByBezierTriangle(
				halfBezierTriangle,
				topHalfTriangle,
			),
			depth - 1,
		);

		var heartRightLowerForHalf = heartRightLower.map(makeRightHalf);
		var lowerFullTriangle = [
			heartRightLowerForHalf[0],
			interpolateBarycentric([0, 1, 0], heartRightLowerForHalf[0], 2 / 3),
			interpolateBarycentric([0, 1, 0], heartRightLowerForHalf[0], 1 / 3),
			[0, 1, 0],
			interpolateBarycentric([0, 1, 0], heartRightLowerForHalf[3], 1 / 3),
			interpolateBarycentric([0, 1, 0], heartRightLowerForHalf[3], 2 / 3),
			heartRightLowerForHalf[3],
			heartRightLowerForHalf[2],
			heartRightLowerForHalf[1],
		];
		drawSierpinskiHeart(
			ctx,
			lineWidth,
			baseTriangleCartesian,
			heartInRightHalfBarycentricBezier,
			heartRightUpper,
			heartRightLower,

			transformBezierTriangleByBezierTriangle(
				halfBezierTriangle,
				lowerFullTriangle,
			),
			depth - 1,
		);
	}
}

function drawPath(
	ctx: CanvasRenderingContext2D,
	lineWidth: number,
	baseTriangleCartesian: Triangle,
	path: Path,
) {
	ctx.strokeStyle = "red";
	ctx.beginPath();
	ctx.lineWidth = lineWidth;
	pathBarycentricToCartesian(baseTriangleCartesian, path).forEach(function(
		bezier,
	) {
		ctx.moveTo.apply(ctx, bezier[0]);
		ctx.bezierCurveTo.apply(ctx, flatten(bezier.slice(1)));
	});
	ctx.stroke();
}

function transformPathByBezierTriangle(bezierTriangle: Triangle, path: Path) {
	return path.map(function(bezier) {
		return bezier.map(function(b) {
			return evaluateBezierTriangle(bezierTriangle, b);
		});
	});
}

function transformBezierTriangleByBezierTriangle(
	transformer: Triangle,
	transformee: Triangle,
) {
	// return transformee.map(barycentricTriangleEvaluator())

	// TODO: Just using the resulting bezier patch coord for the tangents is plain wrong.
	return transformee.map(function(b) {
		return evaluateBezierTriangle(transformer, b);
	});
}

function bezierTriangleByBezierTriangleTransformer(transformer: Triangle) {
	return function(transformee: Triangle) {
		return transformBezierTriangleByBezierTriangle(transformer, transformee);
	};
}

function evaluateBezierTriangle(bezierTriangle: Triangle, b: Coord) {
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

function makeSubTriangles(bezierTriangle: Triangle) {
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

function bAvg(...coords: Array<Coord>) {
	var result = [0, 0, 0];

	for (var i = 0; i < coords.length; i++) {
		result[0] += coords[i][0];
		result[1] += coords[i][1];
		result[2] += coords[i][2];
	}

	result[0] /= coords.length;
	result[1] /= coords.length;
	result[2] /= coords.length;

	return result;
}

function evaluateBarycentricTriangle(triangle: Triangle, b: Coord) {
	return [
		triangle[0][0] * b[0] + triangle[1][0] * b[1] + triangle[2][0] * b[2],
		triangle[0][1] * b[0] + triangle[1][1] * b[1] + triangle[2][1] * b[2],
		triangle[0][2] * b[0] + triangle[1][2] * b[1] + triangle[2][2] * b[2],
	];
}

function barycentricTriangleEvaluator(triangle: Triangle) {
	return function(b: Coord) {
		return evaluateBarycentricTriangle(triangle, b);
	};
}

function makeRightHalf(b: Coord) {
	return [b[0], b[1] - b[2], b[2] * 2];
}

function unmakeRightHalf(b: Coord) {
	var newB2 = b[2] / 2;

	return [b[0], b[1] + newB2, newB2];
}

function interpolateBarycentric(a: Coord, b: Coord, factor: number) {
	return [
		a[0] * (1 - factor) + b[0] * factor,
		a[1] * (1 - factor) + b[1] * factor,
		a[2] * (1 - factor) + b[2] * factor,
	];
}

(function main() {
	var canvas = document.getElementById("canvas") as HTMLCanvasElement;
	var ctx = canvas.getContext("2d")!;

	var pixelDensity = window.devicePixelRatio;
	var lineWidth = 2 * pixelDensity;
	var canvasSize = [
		canvas.clientWidth * pixelDensity,
		canvas.clientHeight * pixelDensity,
	];
	canvas.setAttribute("width", canvasSize[0] + "px");
	canvas.setAttribute("height", canvasSize[1] + "px");

	var triangleHeightFactor = Math.sqrt(0.75);
	var triangleSize = [
		Math.min(canvasSize[0], canvasSize[1] / triangleHeightFactor) -
			2 * lineWidth,
		Math.min(canvasSize[1], canvasSize[0] * triangleHeightFactor) -
			2 * lineWidth,
	];
	var margin = vsMul(vSub(canvasSize, triangleSize), 1 / 2);
	var baseTriangleCartesian = [
		vAdd(margin, [triangleSize[0] / 2, 0]),
		vAdd(margin, [triangleSize[0], triangleSize[1]]),
		vAdd(margin, [0, triangleSize[1]]),
	];

	var heartRightUpper = [
		[1 / 2, 1 / 4, 1 / 4],
		[13 / 20, 5 / 20, 2 / 20],
		[6 / 10, 4 / 10, 0],
		[1 / 2, 1 / 2, 0],
	];

	var heartRightLower = [
		[1 / 2, 1 / 2, 0],
		[4 / 10, 6 / 10, 0],
		[3 / 16, 10 / 16, 3 / 16],
		[0, 1 / 2, 1 / 2],
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
		[1, 0, 0],
		[2 / 3, 1 / 3, 0],
		[1 / 3, 2 / 3, 0],
		[0, 1, 0],
		[0, 2 / 3, 1 / 3],
		[0, 1 / 3, 2 / 3],
		[0, 0, 1],
		[1 / 3, 0, 2 / 3],
		[2 / 3, 0, 1 / 3],
	];

	drawSierpinskiHeart(
		ctx,
		lineWidth,
		baseTriangleCartesian,
		heartInRightHalfBarycentricBezier,
		heartRightUpper,
		heartRightLower,

		baseBezierTriangle,
		7,
	);
})();
