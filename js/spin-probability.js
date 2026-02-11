/* spin-probability.js
   Dùng cho Winwheel của bạn để điều chỉnh tỉ lệ trúng theo MỆNH GIÁ (text).

   ✅ Cách hoạt động:
   - Bạn khai báo trọng số (weight) cho từng mệnh giá trong PRIZE_WEIGHTS.
   - Code tự chia weight đó đều cho các ô có cùng mệnh giá (ví dụ "50.000 VNĐ" xuất hiện 3 ô).
   - Khi bấm quay, code chọn 1 ô theo weight => lấy góc ngẫu nhiên nằm trong ô đó bằng getRandomForSegment()
     => gán vào theWheel.animation.stopAngle rồi startAnimation().

   Lưu ý quan trọng:
   - Trong HTML bạn để numSegments: 11 nhưng thực tế bạn chỉ khai báo 10 segments.
     Hãy sửa numSegments = 10 (hoặc thêm segment thứ 11), nếu không Winwheel sẽ có 1 ô rỗng.
*/

// 1) Khai báo tỉ lệ theo MỆNH GIÁ (weight càng lớn => càng dễ trúng)
const PRIZE_WEIGHTS = {
  "10.000 VNĐ": 50,
  "20.000 VNĐ": 40,
  "50.000 VNĐ": 0.1,     // gần như không trúng;
  "Ô mất lượt": 100
};

// 2) Helper: chọn index theo trọng số (weights là mảng số dương; index trả về là segmentIndex (1-based))
function pickWeightedSegmentIndex(weights) {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += Math.max(0, Number(weights[i]) || 0);
  if (sum <= 0) return 1; // fallback

  let r = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, Number(weights[i]) || 0);
    if (r <= 0) return i + 1; // 1-based for Winwheel
  }
  return weights.length; // fallback
}

// 3) Từ PRIZE_WEIGHTS (theo text) => tạo weight theo từng segmentIndex (1..numSegments)
function buildSegmentWeightsFromText(theWheel, prizeWeightsByText) {
  const n = theWheel.numSegments;
  const texts = [];
  for (let i = 1; i <= n; i++) texts.push((theWheel.segments[i] && theWheel.segments[i].text) ? theWheel.segments[i].text : "");

  // Đếm số lần xuất hiện của mỗi text
  const counts = {};
  for (const t of texts) counts[t] = (counts[t] || 0) + 1;

  // Tạo weights theo từng segment: weight(text)/count(text)
  const weights = [];
  for (let i = 0; i < n; i++) {
    const t = texts[i];
    const wText = Number(prizeWeightsByText[t]);
    if (!isFinite(wText) || wText <= 0) {
      weights.push(0);
    } else {
      weights.push(wText / (counts[t] || 1));
    }
  }
  return weights;
}

// 4) Hàm randomAngle mới: chọn ô theo weight rồi trả stopAngle phù hợp Winwheel
function randomAngleByDenomination(theWheel) {
  const segWeights = buildSegmentWeightsFromText(theWheel, PRIZE_WEIGHTS);
  const segIndex = pickWeightedSegmentIndex(segWeights);

  // getRandomForSegment trả về 1 góc nằm trong segment đó => dùng trực tiếp làm stopAngle
  const stopAngle = theWheel.getRandomForSegment(segIndex);
  return { segIndex, stopAngle };
}

/* ===========================
   CÁCH TÍCH HỢP VÀO CODE CỦA BẠN
   ===========================

   1) Đảm bảo numSegments khớp với số segments (hiện bạn đang có 10 segments):
      -> sửa: 'numSegments': 10

   2) Trong startSpin() của bạn, thay đoạn:
        theWheel.animation.stopAngle = randomAngle();

      BẰNG:
        const pick = randomAngleByDenomination(theWheel);
        theWheel.animation.stopAngle = pick.stopAngle;

      (phần còn lại giữ nguyên)

*/

// Ví dụ patch cho startSpin (bạn copy thay đúng function startSpin hiện tại)
function startSpinWeighted(theWheel) {
  const pick = randomAngleByDenomination(theWheel);
  theWheel.animation.stopAngle = pick.stopAngle;

  // bạn vẫn có thể giữ wheelPower / wheelSpinning như code cũ:
  // theWheel.animation.spins = wheelPower;
  // theWheel.startAnimation();
}
