const PI = 3.141592653589793238462643383279

let lenBody = 150; // Length of body
let lenArm = 100; // Length of arm
let dist = lenBody + Math.sqrt(3) * lenArm; // Distance between the end points of arms

inputArm.value = lenArm
inputBody.value = lenBody

// The second law of cosines
function getLength(a, b, theta) {
  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(theta));
}

// The inverse second law of cosines
function getAngle(a, b, c) {
  return Math.acos((a * a + b * b - c * c) / (2 * a * b));
}

// Calculate the anchor angle (the angle between the horizontal line and the arm)
// The parameters `left` and `right` are angles between body and arms.
function anchorAngle(left, right) {
  let h = lenArm * (Math.sin(left) - Math.sin(right))
  let ru = Math.asin(h / dist)
  let aaR = 3 * PI / 2 - right + ru
  return [left + right + aaR - PI / 2, PI / 2 + aaR]
}

// When given the angle between one arm and the body, the angle between the other arm and the body
function oppositeAngle(angle) {
  let a = getLength(lenBody, lenArm, angle);
  if (angle > PI)
    return -getAngle(a, lenBody, lenArm) + getAngle(a, lenArm, dist);
  else
    return getAngle(a, lenBody, lenArm) + getAngle(a, lenArm, dist);
}

// The coordinates of a point `len` pixel away from (x,y) with angle
function getPoint(x, y, len, angle) {
  return [x + Math.cos(angle) * len, y - Math.sin(angle) * len]
}

// Calculate distacne between two points
function dst(x1, y1, x2, y2) {
  let dx = x2 - x1
  let dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

// Initialize canvas sieze
let [w, h] = [cnv.clientWidth, cnv.clientHeight]
cnv.width = w;
cnv.height = h;
let ctx = cnv.getContext("2d")

// Draw robot on canvas
function draw(left, right, phase3) {
  ctx.clearRect(0, 0, 9999, 9999)
  ctx.beginPath()

  const yPos = 200

  if (!phase3) {
    let ahL = [100, yPos]
    let acR = [100 + dist, yPos]

    let [aaL, aaR] = anchorAngle(left, right)

    let bdL = getPoint(...ahL, lenArm, aaL)
    let bdR = getPoint(...acR, lenArm, aaR)

    ctx.moveTo(...ahL)
    ctx.lineTo(...bdL)

    ctx.moveTo(...acR)
    ctx.lineTo(...bdR)

    ctx.moveTo(...bdL)
    ctx.lineTo(...bdR)

    ctx.stroke()
  }
  else {
    let bdL = [100 + lenArm * Math.sqrt(3) / 2, yPos - lenArm / 2]
    let bdR = [100 + lenArm * Math.sqrt(3) / 2 + lenBody, yPos - lenArm / 2]

    let aL = getPoint(...bdL, lenArm, left)
    let aR = getPoint(...bdR, lenArm, PI - right)

    ctx.moveTo(...bdL)
    ctx.lineTo(...aL)

    ctx.moveTo(...bdR)
    ctx.lineTo(...aR)

    ctx.moveTo(...bdL)
    ctx.lineTo(...bdR)
  }

  ctx.stroke()
}

// sleep(ms) function that can be used in async function
const sleep = t => new Promise((res, rej) => setTimeout(res, t))

const startAngle = PI * 5 / 6
const endAngle = PI * 2 - getAngle(lenArm, lenBody / 2, dist / 2)

// Main function(for async use)
async function main() {
  let left, right

  while (true) {
    let text = 'Left arm angle(rad)\tRight arm angle(rad)\n'

    try {
      // Phase 1
      for (let t = startAngle; t < endAngle; t += 0.01) {
        right = t
        left = oppositeAngle(t, lenBody, dist, lenArm);
        draw(left, right)
        text += left + '\t' + right + '\n'
        await sleep(10)
      }

      // Phase 2
      for (let t = endAngle; t > startAngle; t -= 0.01) {
        right = PI * 2 - oppositeAngle(t, lenBody, dist, lenArm);
        left = PI * 2 - t
        draw(left, right)
        text += left + '\t' + right + '\n'
        await sleep(10)
      }

      // Phase 3(lift arms)
      for (let t = PI * 2 - startAngle; t > startAngle; t -= 0.01) {
        left = t
        right = t
        draw(left, right, true)
        text += left + '\t' + right + '\n'
        await sleep(10)
      }

      log.value = text

      await sleep(500)
    } catch (_) {
      console.log(_)
    }
    await sleep(500);
  }
}

main()

// Control listener linstener
function updateArm(event) {
  lenArm = +event.target.value
  dist = lenBody + Math.sqrt(3) * lenArm;
  endAngle = PI * 2 - getAngle(lenArm, lenBody / 2, dist / 2)
}

function updateBody(event) {
  lenBody = +event.target.value
  dist = lenBody + Math.sqrt(3) * lenArm;
  endAngle = PI * 2 - getAngle(lenArm, lenBody / 2, dist / 2)
}