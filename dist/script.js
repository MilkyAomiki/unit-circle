import * as fractionJs from "https://cdn.skypack.dev/fraction.js@4.1.2";
const Fraction = fractionJs.Fraction;

function setAngleInput(angle) {
  const inp = document.getElementById("angleinp");
  inp.value = angle;
}

function initCanvas()
{
  const canvas = document.getElementById("unitCircle");
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  const unit = Math.min(canvas.height / 4, canvas.width / 4);
  const origin = {
    x: canvas.width / 2,
    y: canvas.height / 2 };


  let snapshot;
  const ctx = canvas.getContext("2d");
  ctx.translate(origin.x, origin.y);

  drawUnitCircle();
  takeSnapshot();
  let isDragging = false;
  let anglePoint;
  let angle = 3 * Math.PI / 4;

  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("mouseup", stopDrag);
  canvas.addEventListener("mousemove", drag);

  drawAngle(angle);

  function startDrag(event) {
    const rect = toCanvasCoordinates(event);
    if (Math.sqrt(Math.pow(rect.x - anglePoint.x, 2) + Math.pow(rect.y - anglePoint.y, 2)) <= anglePoint.radius * 2.5)
    {
      isDragging = true;
      restoreSnapshot();
      drawAngle(angle);
    }
  }

  function drag(event) {
    if (isDragging) {
      const rect = toCanvasCoordinates(event);
      restoreSnapshot();
      rect.y *= -1;
      angle = getAngleWithOrigin(rect);
      drawAngle(angle);
    }
  }

  function stopDrag(event) {
    if (isDragging) {
      isDragging = false;
      restoreSnapshot();
      drawAngle(angle);
    }
  }

  function getAngleWithOrigin(coordinates) {
    const a = unit;
    const b = Math.sqrt(Math.pow(coordinates.x, 2) + Math.pow(coordinates.y, 2));
    const c = Math.sqrt(Math.pow(coordinates.x - unit, 2) + Math.pow(coordinates.y, 2));

    let f = (a * a + b * b - c * c) / (2 * a * b);
    let ang = Math.acos(f);
    if (coordinates.y < 0) {
      ang = 2 * Math.PI - ang;
    }

    return ang;
  }

  function toCanvasCoordinates(event) {
    return {
      x: event.clientX - canvas.getBoundingClientRect().left - canvas.width / 2,
      y: event.clientY - canvas.getBoundingClientRect().top - canvas.height / 2 };

  }

  function takeSnapshot() {
    ctx.save();
    snapshot = ctx.getImageData(-canvas.width / 2, -canvas.height / 2, canvas.width * 2, canvas.height * 2);
  }

  function restoreSnapshot() {
    ctx.restore();
    ctx.putImageData(snapshot, -canvas.width / 2, -canvas.height / 2);
  }

  function drawUnitCircle() {
    drawAxis();
    drawCircle();
    setLabels();

    function drawAxis() {
      ctx.moveTo(-canvas.width / 2, 0); //x axes
      ctx.lineTo(canvas.width / 2, 0);
      ctx.stroke();

      ctx.moveTo(0, canvas.height / 2); // y axes
      ctx.lineTo(0, -canvas.height / 2);
      ctx.stroke();
    }

    function drawCircle() {
      ctx.beginPath();
      ctx.arc(
      0,
      0,
      unit,
      0,
      2 * Math.PI);
      ctx.stroke();
    }

    function setLabels() {
      ctx.font = "20px Arial";
      ctx.fillText("0", unit + 10, -5);
      drawPoint(unit, 0, 3, '#e665d7', '#ffffff');

      ctx.fillText("??/2", 3, -unit - 10);
      drawPoint(0, -unit, 3, '#e665d7', '#ffffff');

      ctx.fillText("??", -unit - 20, -5);
      drawPoint(-unit, 0, 3, '#e665d7', '#ffffff');

      ctx.fillText("3??/2", 3, unit + 20);
      drawPoint(0, unit, 3, '#e665d7', '#ffffff');

      ctx.fillText("??/3", 1 / 2 * unit + 5, Math.sqrt(3) / 2 * -unit);
      drawPoint(1 / 2 * unit, Math.sqrt(3) / 2 * -unit, 3, '#e665d7', '#ffffff');

      ctx.fillText("??/4", 1 / Math.sqrt(2) * unit + 5, 1 / Math.sqrt(2) * -unit);
      drawPoint(1 / Math.sqrt(2) * unit, 1 / Math.sqrt(2) * -unit, 3, '#e665d7', '#ffffff');

      ctx.fillText("??/6", Math.sqrt(3) / 2 * unit + 5, 0.5 * -unit);
      drawPoint(Math.sqrt(3) / 2 * unit, 0.5 * -unit, 3, '#e665d7', '#ffffff');
    }
  }

  function drawAngle(angle) {
    angle = -angle;

    let angleInDeg = angle / Math.PI * 180;
    angleInDeg = angleInDeg.toFixed();
    angle = angleInDeg / 180 * Math.PI;

    anglePoint = {
      x: Math.cos(angle) * unit,
      y: Math.sin(angle) * unit,
      radius: 3 };


    ctx.moveTo(0, 0);
    ctx.lineTo(anglePoint.x, anglePoint.y);
    ctx.stroke();

    ctx.moveTo(anglePoint.x, anglePoint.y);
    ctx.lineTo(anglePoint.x, 0);
    ctx.stroke();

    ctx.fillText(Math.cos(-angle).toFixed(2), anglePoint.x / 2, 20);
    ctx.fillText(Math.sin(-angle).toFixed(2), anglePoint.x, anglePoint.y / 2);


    setLabel();
    paintArc();

    function setLabel() {
      ctx.beginPath();
      ctx.arc(
      0,
      0,
      15,
      0,
      angle,
      true);
      ctx.stroke();
      const fraction = toFractionAngle();
      ctx.fillText(fraction, Math.cos(angle / 2) * unit / 4, Math.sin(angle / 2) * unit / 4);
      setAngleInput(fraction);

      function toFractionAngle() {
        let numerator = -1 * angleInDeg;
        let denominator = 180;

        const gcd = calcGcd(numerator, denominator);

        denominator /= gcd;
        numerator /= gcd;

        return `${numerator != 1 ? numerator : ''}??${denominator != 1 ? `/${denominator}` : ''}`;
      }
    }

    function toFractionNum(n) {
      let denominator = Math.pow(10, n.toString().length - Math.trunc(n).toString().length - 2);
      let numerator = n * denominator;

      const gcd = calcGcd(numerator, denominator);

      denominator /= gcd;
      numerator /= gcd;

      return `${numerator}${denominator != 1 ? `/${denominator}` : ''}`;
    }

    function calcGcd(a, b) {
      if (!b) return a;

      return calcGcd(b, a % b);
    }

    function paintArc() {
      ctx.save();

      ctx.beginPath();
      ctx.strokeStyle = "#5358ed";
      ctx.lineWidth *= 2;
      ctx.arc(
      0,
      0,
      unit,
      0,
      angle,
      true);

      ctx.lineTo(0, 0);
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#2baaff";
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.restore();

      if (isDragging)
      {
        drawPoint(anglePoint.x, anglePoint.y, anglePoint.radius * 2, '#e665d7', '#ffffff');
      } else

      {
        drawPoint(anglePoint.x, anglePoint.y, anglePoint.radius, '#e665d7', '#ffffff');
      }

      drawPoint(unit, 0, 3, '#e665d7', '#ffffff');
    }
  }

  function drawPoint(x, y, radius, color, fill) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.strokeStyle = color;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

initCanvas();
document.body.onresize = initCanvas;