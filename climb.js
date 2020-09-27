let body = 150; // 모터 축 사이 간격
let arm = 70; // 팔 길이
let dist = body + Math.sqrt(3) * arm; // 전자석 사이 간격

//제2 코사인 법칙
function getLength(a, b, t) {
  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(t));
}

//역 제2 코사인 법칙
function getAngle(a, b, c) {
  return Math.acos((a * a + b * b - c * c) / (2 * a * b));
}

function anchorAngle(angle, adjSide, oppoSide, side) {
  let a = getLength(adjSide, side, angle);
  if (angle > Math.PI)
    return -getAngle(a, side, adjSide) + getAngle(a, oppoSide, side)
  else
    return getAngle(a, side, adjSide) + getAngle(a, oppoSide, side)
}

function oppositeAngle(angle, adjSide, oppoSide, side) {
  let a = getLength(adjSide, side, angle);
  if (angle > Math.PI)
    return -getAngle(a, adjSide, side) + getAngle(a, side, oppoSide);
  else
    return getAngle(a, adjSide, side) + getAngle(a, side, oppoSide);
}

function getPoint(x, y, len, angle) {
  return [x + Math.cos(angle) * len, y - Math.sin(angle) * len]
}

function dst(x, y, x2, y2) {
  let dx = x2 - x
  let dy = y2 - y
  return Math.sqrt(dx * dx + dy * dy)
}

let ctx = cnv.getContext("2d")


function draw(left, right) {

  let bL = [100, 500]
  let bR = [100 + body, 500]

  let aL = getPoint(...bL, arm, left)
  let aR = getPoint(...bR, arm, Math.PI - right)

  ctx.clearRect(0, 0, 9999, 9999)
  ctx.beginPath()
  ctx.moveTo(...bL)
  ctx.lineTo(...aL)

  ctx.moveTo(...bR)
  ctx.lineTo(...aR)

  ctx.moveTo(...bL)
  ctx.lineTo(...bR)

  ctx.stroke()
}

const sleep = t => new Promise((res, rej) => setTimeout(res, t))

async function main() {
  let left, right
  let startAngle = Math.PI * 5 / 6
  let endAngle = Math.PI * 2 - getAngle(arm, body / 2, dist / 2)

  while (true) {
    try {
      // Phase 1
      // Right-base movement
      for (let t = startAngle; t < endAngle; t += 0.01) {
        right = t
        left = oppositeAngle(t, body, dist, arm);
        draw(left, right)
        await sleep(10)
      }

      // Phase 2
      // Left-base movement
      for (let t = endAngle; t > startAngle; t -= 0.01) {
        right = Math.PI * 2 - oppositeAngle(t, body, dist, arm);
        left = Math.PI * 2 - t
        draw(left, right)
        await sleep(10)
      }
    } catch (_) {
      console.log(_)
    }
    await sleep(500);
    return;
  }
}

main()

function updateArm(event) {
  arm = +event.target.value
  dist = body + Math.sqrt(3) * arm;
}

function updateBody(event) {
  body = +event.target.value
  dist = body + Math.sqrt(3) * arm;
}