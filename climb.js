const PI = 3.141592653589793238462643383279

let body = 150; // 모터 축 사이 간격
let arm = 100; // 팔 길이
let dist = body + Math.sqrt(3) * arm; // 전자석 사이 간격

inputArm.value = arm
inputBody.value = body

// 제2 코사인 법칙
// 두 변 a,b와 끼인각 t가 주어질 때 마주보는 변의 길이를 계산
function getLength(a, b, t) {
  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(t));
}

// 역 제2 코사인 법칙
// 두 변 a,b와 마주보는 변 c가 주어질 때 끼인각을 계산
function getAngle(a, b, c) {
  return Math.acos((a * a + b * b - c * c) / (2 * a * b));
}

// 앵커 각도 계산(수평선과 arm이 이루는 각도)
// left와 right는 각각 body와 arm의 각도.
// 수식은 기하학적으로 푼 것을 대수적으로 전개한 것. 복잡함.
function anchorAngle(left, right) {
  let h = arm * (Math.sin(left) - Math.sin(right))
  let ru = Math.asin(h / dist)
  let aaR = 3 * PI / 2 - right + ru
  return [left + right + aaR - PI / 2, PI / 2 + aaR]
}

// 한쪽 arm과 body가 이 이루는 각도가 주어졌을 때, 다른쪽 arm과 body가 이루는 각도
function oppositeAngle(angle) {
  let a = getLength(body, arm, angle);
  if (angle > PI)
    return -getAngle(a, body, arm) + getAngle(a, arm, dist);
  else
    return getAngle(a, body, arm) + getAngle(a, arm, dist);
}

// (x,y)로부터 기울기 angle(rad)만큼 기울어진 직선을 따라 len만큼 떨어진 점의 좌표
function getPoint(x, y, len, angle) {
  return [x + Math.cos(angle) * len, y - Math.sin(angle) * len]
}

// 두 점의 거리를 계산
function dst(x1, y1, x2, y2) {
  let dx = x2 - x1
  let dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

let [w, h] = [cnv.clientWidth, cnv.clientHeight]
cnv.width = w;
cnv.height = h;
let ctx = cnv.getContext("2d")

// 왼쪽 arm과 오른쪽 arm이 이루는 각으로부터 몸체 기울기 등을 계산하여 화면에 표시
function draw(left, right) {
  ctx.clearRect(0, 0, 9999, 9999)
  ctx.beginPath()
  {
    let ahL = [100, 500]
    let acR = [100 + dist, 500]

    let [aaL, aaR] = anchorAngle(left, right)

    let bdL = getPoint(...ahL, arm, aaL)
    let bdR = getPoint(...acR, arm, aaR)

    ctx.moveTo(...ahL)
    ctx.lineTo(...bdL)

    ctx.moveTo(...acR)
    ctx.lineTo(...bdR)

    ctx.moveTo(...bdL)
    ctx.lineTo(...bdR)

    ctx.stroke()
  }
  {
    let bdL = [300 + dist, 500]
    let bdR = [300 + dist + body, 500]

    let aL = getPoint(...bdL, arm, left)
    let aR = getPoint(...bdR, arm, PI - right)

    ctx.moveTo(...bdL)
    ctx.lineTo(...aL)

    ctx.moveTo(...bdR)
    ctx.lineTo(...aR)

    ctx.moveTo(...bdL)
    ctx.lineTo(...bdR)
  }

  ctx.stroke()
}

// async function내에서 사용가능한 sleep(ms)함수
const sleep = t => new Promise((res, rej) => setTimeout(res, t))

// async하게 스크립트를 실행하기 위한 main함수

let startAngle = PI * 5 / 6
let endAngle = PI * 2 - getAngle(arm, body / 2, dist / 2)

async function main() {
  let left, right

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
        right = PI * 2 - oppositeAngle(t, body, dist, arm);
        left = PI * 2 - t
        draw(left, right)
        await sleep(10)
      }

      await sleep(500)

      // Inverse phase 2
      for (let t = startAngle; t < endAngle; t += 0.01) {
        right = PI * 2 - oppositeAngle(t, body, dist, arm);
        left = PI * 2 - t
        draw(left, right)
        await sleep(10)
      }

      // Inverse phase 1
      for (let t = endAngle; t > startAngle; t -= 0.01) {
        right = t
        left = oppositeAngle(t, body, dist, arm);
        draw(left, right)
        await sleep(10)
      }

      await sleep(500)
    } catch (_) {
      console.log(_)
    }
    await sleep(500);
  }
}

main()

// range input linstener
function updateArm(event) {
  arm = +event.target.value
  dist = body + Math.sqrt(3) * arm;
  endAngle = PI * 2 - getAngle(arm, body / 2, dist / 2)
}

function updateBody(event) {
  body = +event.target.value
  dist = body + Math.sqrt(3) * arm;
  endAngle = PI * 2 - getAngle(arm, body / 2, dist / 2)
}