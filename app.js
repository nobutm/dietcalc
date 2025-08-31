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

function updateActivityDesc() {
  const key = Number($("#activity").value);
  const a = ACTIVITIES[key];
  $("#activity-desc").textContent = a ? `→ ${a.desc}` : "";
}

function calc(weight, bodyFat, activityKey) {
  const a = ACTIVITIES[activityKey];
  if (!a) throw new Error("活動レベルが不正です");
  const leanMass = weight * (1 - bodyFat / 100);
  const bmr = leanMass * 28;
  const tdee = bmr * a.factor;
  return { a, leanMass, bmr, tdee };
}

function renderOutput(inputs, result) {
  const { weight, bodyFat } = inputs;
  const { a, leanMass, bmr, tdee } = result;

  const inputText = [
    `体重: ${toFixed1(weight)} kg`,
    `体脂肪率: ${toFixed1(bodyFat)} %`,
    `活動レベル: ${a.ja} (${a.en}, 係数 ${a.factor})`,
  ].join("\n");

  const stepsText = [
    `除脂肪体重 = 体重 × (1 − 体脂肪率/100) = ${toFixed1(weight)} × (1 − ${toFixed1(bodyFat)}/100) = ${toFixed1(leanMass)} kg`,
    `基礎代謝 = 除脂肪体重 × 28 = ${toFixed1(leanMass)} × 28 = ${toFixed1(bmr)} kcal`,
    `消費カロリー = 基礎代謝 × 活動係数 = ${toFixed1(bmr)} × ${a.factor} = ${toFixed1(tdee)} kcal`,
  ].join("\n");

  const resultText = [
    `除脂肪体重: ${toFixed1(leanMass)} kg`,
    `基礎代謝: ${toFixed1(bmr)} kcal`,
    `活動レベル: ${a.ja} (係数 ${a.factor})`,
    `1日あたりの消費カロリー: ${toFixed1(tdee)} kcal`,
  ].join("\n");

  $("#inputValues").textContent = inputText;
  $("#steps").textContent = stepsText;
  $("#result").textContent = resultText;
  $("#output").hidden = false;
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

  if (!(weight >= 0)) {
    alert("体重を正しく入力してください（0以上の数値）");
    return;
  }
  if (!(bodyFat >= 0 && bodyFat <= 100)) {
    alert("体脂肪率を正しく入力してください（0〜100の数値）");
    return;
  }

  const result = calc(weight, bodyFat, activityKey);
  renderOutput({ weight, bodyFat }, result);
}

function handleReset() {
  $("#tdee-form").reset();
  updateActivityDesc();
  $("#output").hidden = true;
  $("#inputValues").textContent = "";
  $("#steps").textContent = "";
  $("#result").textContent = "";
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  updateActivityDesc();
  $("#activity").addEventListener("change", updateActivityDesc);
  $("#tdee-form").addEventListener("submit", handleSubmit);
  $("#reset").addEventListener("click", handleReset);
});

