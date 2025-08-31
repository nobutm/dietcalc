// 活動レベル定義（CLIと同一の文言）
const ACTIVITIES = {
  1: {
    ja: "座りがち",
    en: "Sedentary",
    factor: 1.2,
    desc: "デスクワーク中心、通勤や買い物以外ほとんど歩かない",
  },
  2: {
    ja: "軽い運動",
    en: "Lightly Active",
    factor: 1.375,
    desc: "週1〜3回の軽い運動（散歩・軽いウォーキング）、\n立ち仕事が多め",
  },
  3: {
    ja: "中程度の運動",
    en: "Moderately Active",
    factor: 1.55,
    desc: "週3〜5回の運動（速歩ウォーキング・軽いジョギング・\nサイクリング・ヨガなど）",
  },
  4: {
    ja: "非常に活発",
    en: "Very Active",
    factor: 1.725,
    desc: "ほぼ毎日の運動（ランニング・水泳・筋トレ・\n登山など）、肉体労働が中心の仕事",
  },
  5: {
    ja: "極めて活発",
    en: "Extra Active",
    factor: 1.9,
    desc: "1日2回のトレーニングを行うアスリート、\n建設業・農業など非常に体を使う仕事",
  },
};

const $ = (sel) => document.querySelector(sel);

function toFixed1(n) {
  return Number.isFinite(n) ? n.toFixed(1) : "";
}
function toFixed0(n) {
  return Number.isFinite(n) ? Math.round(n).toString() : "";
}

function updateTargetOptions() {
  const weight = Number($("#weight").value);
  const sel = $("#target");
  if (!sel) return;

  // 1.0kg 〜 体重の4% までを 0.5kg 刻みで生成
  const minKg = 1.0;
  let maxKg = Number.isFinite(weight) && weight > 0 ? weight * 0.04 : minKg;
  // 0.5刻みの下限方向に丸め
  maxKg = Math.max(minKg, Math.floor(maxKg / 0.5) * 0.5);

  // 既存オプションをクリア
  sel.innerHTML = "";

  for (let v = minKg; v <= maxKg + 1e-9; v += 0.5) {
    const opt = document.createElement("option");
    opt.value = v.toFixed(1);
    opt.textContent = `${v.toFixed(1)} kg/月`;
    sel.appendChild(opt);
  }
  // デフォルトは最小値（1.0kg）
  sel.value = minKg.toFixed(1);
}

function updateActivityDesc() {
  const key = Number($("#activity").value);
  const a = ACTIVITIES[key];
  $("#activity-desc").textContent = a ? `→ ${a.desc}` : "";
}

function calc(weight, bodyFat, activityKey) {
  const a = ACTIVITIES[activityKey];
  if (!a) throw new Error("活動レベルが不正です");
  const leanMass = weight * (1 - bodyFat / 100);

  // LBMに応じたBMR計算式の切り替え
  let formulaName = "";
  let bmr = NaN;
  if (leanMass < 45) {
    // Katch–McArdle式: BMR = 370 + 21.6 × LBM
    formulaName = "Katch–McArdle";
    bmr = 370 + 21.6 * leanMass;
  } else if (leanMass <= 60) {
    // 簡易式: BMR = 28 × LBM
    formulaName = "簡易式";
    bmr = 28 * leanMass;
  } else {
    // Cunningham式: BMR = 500 + 22 × LBM
    formulaName = "Cunningham";
    bmr = 500 + 22 * leanMass;
  }

  const tdee = bmr * a.factor;
  return { a, leanMass, bmr, tdee, formulaName };
}

function renderOutput(inputs, result) {
  const { weight, bodyFat, targetLoss } = inputs;
  const { a, leanMass, bmr, tdee, formulaName } = result;

  const inputText = [
    `体重: ${toFixed1(weight)} kg`,
    `体脂肪率: ${toFixed1(bodyFat)} %`,
    `除脂肪体重(LBM): ${toFixed1(leanMass)} kg`,
    `活動係数: ${a.factor}（${a.ja}/${a.en}）`,
  ].join("\n");

  let bmrStep = "";
  if (formulaName === "Katch–McArdle") {
    bmrStep = `基礎代謝（Katch–McArdle） = 370 + 21.6 × LBM = 370 + 21.6 × ${toFixed1(leanMass)} = ${toFixed1(bmr)} kcal`;
  } else if (formulaName === "簡易式") {
    bmrStep = `基礎代謝（簡易式） = 28 × LBM = 28 × ${toFixed1(leanMass)} = ${toFixed1(bmr)} kcal`;
  } else {
    bmrStep = `基礎代謝（Cunningham） = 500 + 22 × LBM = 500 + 22 × ${toFixed1(leanMass)} = ${toFixed1(bmr)} kcal`;
  }

  const stepsText = [
    `除脂肪体重 = 体重 × (1 − 体脂肪率/100) = ${toFixed1(weight)} × (1 − ${toFixed1(bodyFat)}/100) = ${toFixed1(leanMass)} kg`,
    bmrStep,
    `総消費カロリー(TDEE) = 基礎代謝 × 活動係数 = ${toFixed1(bmr)} × ${a.factor} = ${toFixed1(tdee)} kcal`,
  ].join("\n");

  const resultText = [
    `除脂肪体重: ${toFixed1(leanMass)} kg`,
    `基礎代謝(BMR): ${toFixed1(bmr)} kcal`,
    `使用式: ${formulaName}`,
    `活動レベル: ${a.ja} (係数 ${a.factor})`,
    `1日あたりの消費カロリー(TDEE): ${toFixed1(tdee)} kcal`,
  ].join("\n");

  $("#inputValues").textContent = inputText;
  $("#steps").textContent = stepsText;
  $("#result").textContent = resultText;
  $("#output").hidden = false;

  // 目標に基づく摂取カロリー計算
  const deficitPerDay = Math.round((targetLoss * 7700) / 30);
  const intake = tdee - deficitPerDay;
  const weeklyLoss = targetLoss / 4; // 1ヶ月 ≒ 4週として簡便計算

  const targetSummary = [
    `目標: ${toFixed1(targetLoss)} kg/月`,
    `必要赤字: ${toFixed0(deficitPerDay)} kcal/日`,
    `推奨摂取カロリー: ${toFixed0(intake)} kcal/日`,
    `減量ペース: 週あたり${toFixed1(weeklyLoss)} kg、月あたり${toFixed1(targetLoss)} kg`,
  ].join("\n");
  $("#targetSummary").textContent = targetSummary;
  $("#calWarn").hidden = !(intake < 1200);

  // PFCバランス計算（P=25%, F=25%, C=50%）
  const pGram = intake * 0.25 / 4; // 4 kcal/g
  const fGram = intake * 0.25 / 9; // 9 kcal/g
  const cGram = intake * 0.50 / 4; // 4 kcal/g

  // 食品換算
  const chickenG = Math.round((pGram / 32) * 100); // 100gあたり32gP
  const eggs = Math.round(pGram / 6); // 1個6gP
  const oilTbsp = (fGram / 13.6); // 大さじ1=13.6g
  const riceG = Math.round((cGram / 28) * 100); // 100gで28gC
  const pastaG = Math.round((cGram / 25) * 100); // 100gで25gC
  const udonG = Math.round((cGram / 21) * 100); // 100gで21gC

  const pfcSummary = [
    `タンパク質: ${toFixed0(pGram)} g`,
    `→ 鶏むね肉 約${toFixed0(chickenG)} g`,
    `→ 卵 約${toFixed0(eggs)} 個`,
    `脂質: ${toFixed0(fGram)} g`,
    `→ 油 約${toFixed1(oilTbsp)} 大さじ`,
    `炭水化物: ${toFixed0(cGram)} g`,
    `→ ご飯 約${toFixed0(riceG)} g`,
    `→ パスタ 約${toFixed0(pastaG)} g`,
    `→ うどん 約${toFixed0(udonG)} g`,
  ].join("\n");
  $("#pfcSummary").textContent = pfcSummary;
}

function parseNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function handleSubmit(e) {
  e.preventDefault();
  const weight = parseNumber($("#weight").value);
  const bodyFat = parseNumber($("#bodyFat").value);
  const activityKey = Number($("#activity").value);
  const targetLoss = parseNumber($("#target").value);

  if (!(weight >= 0)) {
    alert("体重を正しく入力してください（0以上の数値）");
    return;
  }
  if (!(bodyFat >= 0 && bodyFat <= 100)) {
    alert("体脂肪率を正しく入力してください（0〜100の数値）");
    return;
  }

  const result = calc(weight, bodyFat, activityKey);
  renderOutput({ weight, bodyFat, targetLoss }, result);
}

function handleReset() {
  $("#tdee-form").reset();
  updateActivityDesc();
  updateTargetOptions();
  $("#output").hidden = true;
  $("#inputValues").textContent = "";
  $("#steps").textContent = "";
  $("#result").textContent = "";
  $("#targetSummary").textContent = "";
  $("#pfcSummary").textContent = "";
  $("#calWarn").hidden = true;
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  updateActivityDesc();
  updateTargetOptions();
  $("#weight").addEventListener("input", updateTargetOptions);
  $("#activity").addEventListener("change", updateActivityDesc);
  $("#tdee-form").addEventListener("submit", handleSubmit);
  $("#reset").addEventListener("click", handleReset);
});

