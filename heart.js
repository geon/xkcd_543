/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var heartTopTouchTriangle = { a: 1 / 2, b: 1 / 2, c: 0 };
var topCorner = { a: 1, b: 0, c: 0 };
var rightCorner = { a: 0, b: 1, c: 0 };
var leftCorner = { a: 0, b: 0, c: 1 };
var heartFold = { a: 1 / 2, b: 1 / 4, c: 1 / 4 };
var bottomMidpoint = { a: 0, b: 1 / 2, c: 1 / 2 };
var heartRightUpper = {
    a: heartFold,
    b: interpolateBarycentric(heartFold, interpolateBarycentric(topCorner, rightCorner, 0.3), 0.5),
    c: interpolateBarycentric(heartTopTouchTriangle, topCorner, 0.15),
    d: heartTopTouchTriangle,
};
var heartRightLower = {
    a: heartTopTouchTriangle,
    b: interpolateBarycentric(heartTopTouchTriangle, rightCorner, 0.35),
    c: interpolateBarycentric(interpolateBarycentric(topCorner, leftCorner, 0.6), rightCorner, 0.45),
    d: bottomMidpoint,
};
var heartCurves = [heartRightUpper, heartRightLower];
function vAdd() {
    var vectors = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        vectors[_i] = arguments[_i];
    }
    var result = { x: 0, y: 0 };
    for (var i = 0; i < vectors.length; i++) {
        result.x += vectors[i].x;
        result.y += vectors[i].y;
    }
    return result;
}
function vSub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
function vsMul(v, s) {
    return { x: v.x * s, y: v.y * s };
}
function coordBarycentricToCartesian(triangle, coord) {
    return vAdd(vsMul(triangle.a, coord.a), vsMul(triangle.b, coord.b), vsMul(triangle.c, coord.c));
}
function mirrorBarycentric(coord) {
    return { a: coord.a, b: coord.c, c: coord.b };
}
function mirrorTesselatedPath(path) {
    return {
        points: path.points.map(mirrorBarycentric),
        color: path.color,
    };
}
function tesselateSierpinskiHeart(depth) {
    var subHeartWarpTriangles = buildSubHeartWarpTriangles();
    var lastIterationHalf = [];
    var lastIterationFull = [];
    for (var currentDepth = 1; currentDepth <= depth; ++currentDepth) {
        var halfHeart = {
            points: tesselatePath(heartCurves, Math.max(1, Math.ceil(currentDepth * 2))),
            color: currentDepth % 2 ? "red" : "black",
        };
        lastIterationHalf = mapTesselatedPathsToBezierTriangle(makeRightHalfTesselatedPaths(lastIterationHalf), subHeartWarpTriangles.topHalfTriangle).concat(mapTesselatedPathsToBezierTriangle(lastIterationFull, subHeartWarpTriangles.lowerFullTriangle), [
            halfHeart,
        ]);
        lastIterationFull = lastIterationHalf.concat(lastIterationHalf.map(mirrorTesselatedPath));
    }
    return lastIterationFull;
}
function buildSubHeartWarpTriangles() {
    var heartRightUpperForHalf = heartRightUpper;
    var fullA = { a: 1, b: 0, c: 0 };
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
    var heartRightLowerForHalf = heartRightLower;
    var fullB = { a: 0, b: 1, c: 0 };
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
    return { topHalfTriangle: topHalfTriangle, lowerFullTriangle: lowerFullTriangle };
}
function mapTesselatedPathsToBezierTriangle(tesselatedPaths, bezierTriangle) {
    return tesselatedPaths.map(function (tesselatedPath) { return ({
        points: tesselatedPath.points.map(function (coord) {
            return evaluateBezierTriangle(bezierTriangle, coord);
        }),
        color: tesselatedPath.color,
    }); });
}
function evaluateBezierCurve(bezierCurve, interpolationFactor) {
    var a = interpolateBarycentric(bezierCurve.a, bezierCurve.b, interpolationFactor);
    var b = interpolateBarycentric(bezierCurve.b, bezierCurve.c, interpolationFactor);
    var c = interpolateBarycentric(bezierCurve.c, bezierCurve.d, interpolationFactor);
    var d = interpolateBarycentric(a, b, interpolationFactor);
    var e = interpolateBarycentric(b, c, interpolationFactor);
    return interpolateBarycentric(d, e, interpolationFactor);
}
function tesselatePath(path, numSegments) {
    var coords = [];
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var curve = path_1[_i];
        for (var i = 0; i <= numSegments; ++i) {
            coords.push(evaluateBezierCurve(curve, i / numSegments));
        }
    }
    return coords;
}
function evaluateBezierTriangle(bezierTriangle, coord) {
    var subTriangles = makeSubTriangles(bezierTriangle);
    return evaluateBarycentricTriangle({
        a: evaluateBarycentricTriangle({
            a: evaluateBarycentricTriangle(subTriangles[0], coord),
            b: evaluateBarycentricTriangle(subTriangles[1], coord),
            c: evaluateBarycentricTriangle(subTriangles[5], coord),
        }, coord),
        b: evaluateBarycentricTriangle({
            a: evaluateBarycentricTriangle(subTriangles[1], coord),
            b: evaluateBarycentricTriangle(subTriangles[2], coord),
            c: evaluateBarycentricTriangle(subTriangles[3], coord),
        }, coord),
        c: evaluateBarycentricTriangle({
            a: evaluateBarycentricTriangle(subTriangles[5], coord),
            b: evaluateBarycentricTriangle(subTriangles[3], coord),
            c: evaluateBarycentricTriangle(subTriangles[4], coord),
        }, coord),
    }, coord);
}
function makeSubTriangles(bezierTriangle) {
    var center = bAvg(bezierTriangle.b, bezierTriangle.c, bezierTriangle.e, bezierTriangle.f, bezierTriangle.h, bezierTriangle.i);
    return [
        { a: bezierTriangle.a, b: bezierTriangle.b, c: bezierTriangle.i },
        { a: bezierTriangle.b, b: bezierTriangle.c, c: center },
        { a: bezierTriangle.c, b: bezierTriangle.d, c: bezierTriangle.e },
        { a: center, b: bezierTriangle.e, c: bezierTriangle.f },
        { a: bezierTriangle.h, b: bezierTriangle.f, c: bezierTriangle.g },
        { a: bezierTriangle.i, b: center, c: bezierTriangle.h },
    ];
}
function bAvg() {
    var coords = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        coords[_i] = arguments[_i];
    }
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
function evaluateBarycentricTriangle(triangle, coord) {
    return {
        a: triangle.a.a * coord.a + triangle.b.a * coord.b + triangle.c.a * coord.c,
        b: triangle.a.b * coord.a + triangle.b.b * coord.b + triangle.c.b * coord.c,
        c: triangle.a.c * coord.a + triangle.b.c * coord.b + triangle.c.c * coord.c,
    };
}
function makeRightHalf(coord) {
    return { a: coord.a, b: coord.b - coord.c, c: coord.c * 2 };
}
function makeRightHalfTesselatedPaths(paths) {
    return paths.map(function (path) { return ({
        points: path.points.map(makeRightHalf),
        color: path.color,
    }); });
}
function interpolateBarycentric(coordA, coordB, factor) {
    return {
        a: coordA.a * (1 - factor) + coordB.a * factor,
        b: coordA.b * (1 - factor) + coordB.b * factor,
        c: coordA.c * (1 - factor) + coordB.c * factor,
    };
}
(function main() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
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
        x: Math.min(canvasSize.x, canvasSize.y / triangleHeightFactor) -
            2 * lineWidth,
        y: Math.min(canvasSize.y, canvasSize.x * triangleHeightFactor) -
            2 * lineWidth,
    };
    var margin = vsMul(vSub(canvasSize, triangleSize), 1 / 2);
    var baseTriangleCartesian = {
        a: vAdd(margin, { x: triangleSize.x / 2, y: 0 }),
        b: vAdd(margin, { x: triangleSize.x, y: triangleSize.y }),
        c: vAdd(margin, { x: 0, y: triangleSize.y }),
    };
    var tesselated = tesselateSierpinskiHeart(7);
    ctx.lineWidth = lineWidth;
    function draw() {
        var _i, tesselated_1, path, coord, _a, _b, barycentricCoord, coord_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, tesselated_1 = tesselated;
                    _c.label = 1;
                case 1:
                    if (!(_i < tesselated_1.length)) return [3 /*break*/, 4];
                    path = tesselated_1[_i];
                    ctx.beginPath();
                    ctx.strokeStyle = path.color;
                    coord = coordBarycentricToCartesian(baseTriangleCartesian, path.points[0]);
                    ctx.moveTo(coord.x, coord.y);
                    for (_a = 0, _b = path.points.slice(1); _a < _b.length; _a++) {
                        barycentricCoord = _b[_a];
                        coord_1 = coordBarycentricToCartesian(baseTriangleCartesian, barycentricCoord);
                        ctx.lineTo(coord_1.x, coord_1.y);
                    }
                    ctx.stroke();
                    return [4 /*yield*/];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }
    var drawer = draw();
    function loop() {
        var next = drawer.next();
        if (!next.done) {
            requestAnimationFrame(loop);
        }
    }
    loop();
})();


/***/ })
/******/ ]);