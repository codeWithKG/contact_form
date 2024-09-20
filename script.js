// properties
let spinCanvas,
    outerArcPath,
    outerArc,
    innerArcPath,
    innerArc,
    centerArcPath,
    centerArc,
    spinCircle,
    innerTimer,
    outerTimer,
    circleInInnerArc = false,
    rotateInner,
    rotateOuter,
    widenInner,
    innerDirection = 'right',
    outerDirection = 'left',
    points = 0,
    boxWidth;

const tau = 2 * Math.PI;

// boot the game
const boot = () => {
    document.getElementById('gameBox')
        .addEventListener('click', (e) => {
            _handleClick(e);
        });
    initGame();
    start();
};

// init the Game
const initGame = () => {
    let currentAngle, outerAngle;
    innerSpeed = 5000;
    outerSpeed = 7000;
    boxWidth = (window.document.getElementById('gameBox').clientWidth * 0.4);
    var spinCircleRadius = boxWidth * 0.05;

    spinCanvas = d3.select(document.getElementById('spinSvg'))
        .attr("width", boxWidth)
        .attr("height", boxWidth)
        .append("g")
        .attr("transform", "translate(" + boxWidth / 2 + "," + boxWidth / 2 + ")");

    outerCenterArcRadius = boxWidth * 0.1;
    innerCenterArcRadius = 0;

    outerInnerArcRadius = boxWidth * 0.25;
    innerInnerArcRadius = boxWidth * 0.15;

    outerOuterArcRadius = boxWidth * 0.4;
    innerOuterArcRadius = boxWidth * 0.3;

    outerLeaveArcRadius = boxWidth * 1.1;
    innerLeaveArcRadius = boxWidth;

    // create center
    centerArc = spinCanvas.append("path")
        .attr('id', 'centerArc')
        .datum({
            innerRadius: innerCenterArcRadius,
            outerRadius: outerCenterArcRadius,
            startAngle: 0,
            endAngle: tau
        }).attr("d", d3.arc());
    // create inner arc
    innerArc = spinCanvas.append("path")
        .attr("id", "innerArc")
        .datum({
            innerRadius: innerInnerArcRadius,
            outerRadius: outerInnerArcRadius,
            startAngle: 0 * Math.PI,
            endAngle: 1.3 * Math.PI
        }).attr("d", d3.arc());
    // create outer arc
    outerArc = spinCanvas.append("path")
        .attr("id", "outerArc")
        .datum({
            innerRadius: innerOuterArcRadius,
            outerRadius: outerOuterArcRadius,
            startAngle: - 0.85 * Math.PI,
            endAngle: 0.85 * Math.PI
        }).attr("d", d3.arc());
    // create helper orbit
    orbit = spinCanvas.append("path")
        .attr("id", "orbit")
        .datum({
            innerRadius: 0.3,
            outerRadius: 0.4,
            startAngle: - 0.85 * Math.PI,
            endAngle: 0.85 * Math.PI
        }).attr("d", d3.arc());
    // create the circle
    spinCircle = spinCanvas.append("circle")
        .attr("fill", "hsl(0, 100%, 50%)")
        .attr("r", spinCircleRadius)
        .attr("cx", 0)
        .attr("cy", boxWidth * 0.35);
    // init timers
    innerTimer = d3.timer(() => { }, 0);
    outerTimer = d3.timer(() => { }, 0);
    // make the arc wider
    widenArc = (innerRadius, outerRadius) => {
        return (d) => {
            let iR = d3.interpolate(d.innerRadius, innerRadius);
            let oR = d3.interpolate(d.outerRadius, outerRadius);
            return (t) => {
                d.innerRadius = iR(t);
                d.outerRadius = oR(t);
                return d3.arc()(d);
            }
        }
    }
    // create a random angle
    randomAngle = () => {
        return (d) => {
            let s = Math.random() * Math.PI;
            let e = s + (Math.random() * (1.6 - 1.3) + 1.3) * Math.PI;

            var interpolateEnd = d3.interpolate(d.endAngle, e);
            var interpolateStart = d3.interpolate(d.startAngle, s);
            return (t) => {
                d.endAngle = interpolateEnd(t);
                d.startAngle = interpolateStart(t);
                return d3.arc()(d);
            }
        }
    };
    // set random speed
    randomSpeed = (outerSpeed) => {
        let min = 3400;
        let max = 8000;
        let speed = 0;

        if (outerDirection == innerDirection) {
            if (outerSpeed >= 6000) {
                return Math.floor(Math.random() * (2600 - 2000) + 2000);
            } else if (outerSpeed >= 5000 && outerSpeed < 6000) {
                return outerSpeed - 2000;
            } else if (outerSpeed >= 4000 && outerSpeed < 5000) {
                return outerSpeed + 2000;
            } else if (outerSpeed < 4000) {
                return outerSpeed + 3000;
            }
        } else {
            return speed = Math.floor(Math.random() * (max - min) + min);
        }
    }

    var innerAngle, ballAngle, innerOpenRadius;
    // rotate the outer angle in given direction
    rotateOuter = (direction) => {
        return (d) => {
            var interpolateEnd = d3.interpolate(d.endAngle, direction == 'left' ? d.endAngle - tau : d.endAngle + tau);
            var interpolateStart = d3.interpolate(d.startAngle, direction == 'left' ? d.startAngle - tau : d.startAngle + tau);

            return (t) => {
                d.endAngle = interpolateEnd(t);
                d.startAngle = interpolateStart(t);
                currentAngle = d.endAngle % (tau) - 0.35 * Math.PI;
                outerAngle = currentAngle + 0.35 * Math.PI;

                return d3.arc()(d);
            }
        }
    };
    // rotate the circle in given direction
    rotateCircle = (direction) => {
        return (d) => {
            var interpolateEnd = d3.interpolate(d.endAngle, direction == 'left' ? d.endAngle - tau : d.endAngle + tau);
            var interpolateStart = d3.interpolate(d.startAngle, direction == 'left' ? d.startAngle - tau : d.startAngle + tau);

            return (t) => {
                d.endAngle = interpolateEnd(t);
                d.startAngle = interpolateStart(t);

                currentAngle = d.endAngle % (tau) - 0.35 * Math.PI;
                outerAngle = currentAngle + 0.35 * Math.PI;

                spinCircle
                    .attr("cx", Math.cos(currentAngle) * boxWidth * 0.35)
                    .attr("cy", Math.sin(currentAngle) * boxWidth * 0.35);

                return d3.arc()(d);
            }
        }
    };
    // rotate the inner angle in given direction
    rotateInner = (direction) => {
        return (d) => {
            var interpolateEnd = d3.interpolate(d.endAngle, direction == 'left' ? d.endAngle - tau : d.endAngle + tau);
            var interpolateStart = d3.interpolate(d.startAngle, direction == 'left' ? d.startAngle - tau : d.startAngle + tau);

            return (t) => {
                d.endAngle = interpolateEnd(t);
                d.startAngle = interpolateStart(t);
                return d3.arc()(d);
            }
        }
    };
}
// stop the game / pause
var stop = () => {
    innerTimer.stop();
    outerTimer.stop();
}
// start / restart the game
var start = () => {
    innerTimer.restart(() => {
        innerArc.transition('rotateInner')
            .duration(innerSpeed)
            .ease(d3.easeLinear)
            .attrTween("d", rotateInner(innerDirection));
    }, 0);
    outerTimer.restart(() => {
        outerArc.transition('rotateOuter')
            .duration(outerSpeed)
            .ease(d3.easeLinear)
            .attrTween("d", rotateOuter(outerDirection));

        orbit.transition('rotateOrbit')
            .duration(outerSpeed)
            .ease(d3.easeLinear)
            .attrTween("d", rotateCircle(outerDirection));
    }, 0);
}

var _handleClick = (e) => {
    var boxWidth = (window.document.body.clientWidth * 0.8);
    let delay = 200;
    // create a new arc with a size of 0 as the new center
    var newArc = spinCanvas.append("path")
        .attr('id', 'centerArc')
        .datum({
            innerRadius: 0,
            outerRadius: 0,
            startAngle: 0,
            endAngle: tau
        }).attr("d", d3.arc());
    // widen the new arc
    newArc.transition('widenNew')
        .duration(delay)
        .ease(d3.easeLinear)
        .attrTween("d", widenArc(innerCenterArcRadius, outerCenterArcRadius));
    // widen the "old" center arc
    centerArc.transition('widenCenter')
        .duration(delay)
        .ease(d3.easeLinear)
        .attrTween("d", widenArc(innerInnerArcRadius, outerInnerArcRadius));
    centerArc.transition('newArc')
        .duration(delay)
        .ease(d3.easeLinear)
        .attrTween('d', randomAngle());
    // ...
    innerArc.transition('widenInner')
        .duration(delay)
        .ease(d3.easeLinear)
        .attrTween("d", widenArc(innerOuterArcRadius, outerOuterArcRadius));
    outerArc.transition('widenOuter')
        .duration(delay)
        .ease(d3.easeLinear)
        .attrTween("d", widenArc(innerLeaveArcRadius, outerLeaveArcRadius));

    // collision detection, new directions, speed and points
    setTimeout(() => {
        outerArc.remove();

        var outer = d3.select(document.querySelector('#innerArc')).attr('id', 'outerArc');
        var inner = d3.select(document.querySelector('#centerArc')).attr('id', 'innerArc');

        outerDirection = innerDirection + "";
        innerDirection = Math.random() < 0.5 ? 'left' : 'right';

        outerSpeed = innerSpeed + 0;
        innerSpeed = 3000;
        innerSpeed = randomSpeed(outerSpeed);

        // --- Collision detection 

        let ballAngle = Math.atan2(-parseFloat(spinCircle.attr('cy')), parseFloat(spinCircle.attr('cx')));
        if (ballAngle < 0) {
            ballAngle = tau + ballAngle;
        }
        let d = outer.datum();

        let s = tau - (d.startAngle % tau);

        if (s <= 1.5 * Math.PI) {
            s = s + 0.5 * Math.PI;
        } else {
            s = s - 1.5 * Math.PI;
        }

        let e = s + (tau - Math.abs(d.startAngle - d.endAngle));
        if (e > tau) {
            e = e - tau;
        }

        let safeZone = -0.05;
        if (e > s) {
            if (ballAngle - safeZone > s && ballAngle + safeZone < e) {
                circleInInnerArc = true;
                points++;
            } else {
                circleInInnerArc = false;
                points = 0;
            }
        } else {
            if (ballAngle - safeZone > s && ballAngle + safeZone > e || ballAngle - safeZone < s && ballAngle + safeZone < e) {
                circleInInnerArc = true;
                points++;
            } else {
                circleInInnerArc = false;
                points = 0;
            }
        }
        document.getElementById('points').innerHTML = points;

        spinCircle.attr('fill', 'hsl(' + (points % 180) * 2 + ', 100%, 50%)')

        outerTimer.restart(() => {
            outer.transition('rotateOuter')
                .duration(outerSpeed)
                .ease(d3.easeLinear)
                .attrTween("d", rotateOuter(outerDirection));
            orbit.transition('rotateOrbit')
                .duration(outerSpeed)
                .ease(d3.easeLinear)
                .attrTween("d", rotateCircle(outerDirection))
        }, 0);

        innerTimer.restart(() => {
            inner.transition('rotateInner')
                .duration(innerSpeed)
                .ease(d3.easeLinear)
                .attrTween("d", rotateInner(innerDirection));
        }, 0);
        d3.timerFlush();

        outerArc = outer;
        innerArc = inner;
        centerArc = newArc;

        document.querySelector('g').appendChild(document.querySelector('circle'));

    }, delay + 60);
}

boot();




