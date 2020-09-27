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


function draw(left, right, phase2 = false) {

  let aL = -anchorAngle(left, body, dist, arm)
  let aR = anchorAngle(right, body, dist, arm) - Math.PI

  if (phase2) {
    aL = Math.PI * 2 - aL
    aR = Math.PI * 2 - aR
  }

  let anchorL = [100, 500]
  let anchorR = [100 + dist, 500]

  let bodyL = getPoint(...anchorL, arm, aL)
  let bodyR = getPoint(...anchorR, arm, aR)

  ctx.clearRect(0, 0, 9999, 9999)
  ctx.beginPath()
  ctx.moveTo(...anchorL)
  ctx.lineTo(...bodyL)

  ctx.moveTo(...anchorR)
  ctx.lineTo(...bodyR)

  ctx.moveTo(...bodyL)
  ctx.lineTo(...bodyR)
  ctx.stroke()
}

const sleep = t => new Promise((res, rej) => setTimeout(res, t))

async function main() {
  let startAngle, endAngle, left, right

  while (true) {
    try {
      // Phase 1
      // Right-base movement
      startAngle = Math.PI * 5 / 6
      endAngle = Math.PI * 2 - getAngle(arm, body / 2, dist / 2)
      for (right = startAngle; right < endAngle; right += 0.01) {
        left = oppositeAngle(right, body, dist, arm);
        draw(left, right)
        await sleep(10)
      }

      // Phase 2
      // Left-base movement
      startAngle = Math.PI * 2 - getAngle(arm, body / 2, dist / 2)
      endAngle = Math.PI * 5 / 6
      for (left = startAngle; left > endAngle; left -= 0.01) {
        right = oppositeAngle(left, body, dist, arm);
        draw(left, right, true)
        await sleep(10)
      }

      await sleep(500);

      // Phase 2 - reverse
      startAngle = Math.PI * 5 / 6
      endAngle = Math.PI * 2 - getAngle(arm, body / 2, dist / 2)
      for (left = startAngle; left < endAngle; left += 0.01) {
        right = oppositeAngle(left, body, dist, arm);
        draw(left, right, true)
        await sleep(20)
      }

      // Phase 1 - reverse
      startAngle = Math.PI * 2 - getAngle(arm, body / 2, dist / 2)
      endAngle = Math.PI * 5 / 6
      for (right = startAngle; right > endAngle; right -= 0.01) {
        left = oppositeAngle(right, body, dist, arm);
        draw(left, right)
        await sleep(20)
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