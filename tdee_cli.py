#!/usr/bin/env python3

"""
1日あたりの消費カロリー(TDEE)を計算するコンソール用スクリプト。

計算式:
  除脂肪体重(kg) = 体重(kg) × (1 − 体脂肪率 / 100)
  基礎代謝(kcal) = 除脂肪体重 × 28
  消費カロリー(kcal) = 基礎代謝 × 活動係数

入力: 体重(kg), 体脂肪率(%), 活動レベル(1-5)
出力: 入力値、計算過程、最終結果
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Activity:
    key: int
    ja: str
    en: str
    factor: float


ACTIVITIES = {
    1: Activity(1, "座りがち", "Sedentary", 1.2),
    2: Activity(2, "軽い運動", "Lightly Active", 1.375),
    3: Activity(3, "中程度の運動", "Moderately Active", 1.55),
    4: Activity(4, "非常に活発", "Very Active", 1.725),
    5: Activity(5, "極めて活発", "Extra Active", 1.9),
}


def ask_float(prompt: str, *, min_value: float | None = None, max_value: float | None = None) -> float:
    while True:
        try:
            raw = input(prompt).strip()
            value = float(raw)
            if min_value is not None and value < min_value:
                print(f"値が小さすぎます。{min_value}以上を入力してください。")
                continue
            if max_value is not None and value > max_value:
                print(f"値が大きすぎます。{max_value}以下を入力してください。")
                continue
            return value
        except ValueError:
            print("数値で入力してください。例: 70, 20.5 など")


def ask_activity() -> Activity:
    print("活動レベルを選んでください:")
    print(" 1 = 座りがち（Sedentary, 係数 1.2）")
    print("     → デスクワーク中心、通勤や買い物以外ほとんど歩かない")
    print(" 2 = 軽い運動（Lightly Active, 係数 1.375）")
    print("     → 週1〜3回の軽い運動（散歩・軽いウォーキング）、")
    print("       立ち仕事が多め")
    print(" 3 = 中程度の運動（Moderately Active, 係数 1.55）")
    print("     → 週3〜5回の運動（速歩ウォーキング・軽いジョギング・")
    print("       サイクリング・ヨガなど）")
    print(" 4 = 非常に活発（Very Active, 係数 1.725）")
    print("     → ほぼ毎日の運動（ランニング・水泳・筋トレ・")
    print("       登山など）、肉体労働が中心の仕事")
    print(" 5 = 極めて活発（Extra Active, 係数 1.9）")
    print("     → 1日2回のトレーニングを行うアスリート、")
    print("       建設業・農業など非常に体を使う仕事")
    while True:
        raw = input("選択してください (1-5): ").strip()
        if raw.isdigit():
            key = int(raw)
            if key in ACTIVITIES:
                return ACTIVITIES[key]
        print("1〜5の番号で選択してください。")


def main() -> None:
    weight = ask_float("体重(kg)を入力してください: ", min_value=0.0)
    body_fat = ask_float("体脂肪率(%)を入力してください: ", min_value=0.0, max_value=100.0)
    activity = ask_activity()

    # 計算
    lean_mass = weight * (1.0 - body_fat / 100.0)
    bmr = lean_mass * 28.0
    tdee = bmr * activity.factor

    # 出力
    print()
    print("[入力値]")
    print(f"体重: {weight:.1f} kg")
    print(f"体脂肪率: {body_fat:.1f} %")
    print(f"活動レベル: {activity.ja} ({activity.en}, 係数 {activity.factor})")

    print()
    print("[計算過程]")
    print(
        f"除脂肪体重 = 体重 × (1 − 体脂肪率/100) = "
        f"{weight:.1f} × (1 − {body_fat:.1f}/100) = {lean_mass:.1f} kg"
    )
    print(f"基礎代謝 = 除脂肪体重 × 28 = {lean_mass:.1f} × 28 = {bmr:.1f} kcal")
    print(
        f"消費カロリー = 基礎代謝 × 活動係数 = {bmr:.1f} × {activity.factor} = {tdee:.1f} kcal"
    )

    print()
    print("[計算結果]")
    print(f"除脂肪体重: {lean_mass:.1f} kg")
    print(f"基礎代謝: {bmr:.1f} kcal")
    print(f"活動レベル: {activity.ja} (係数 {activity.factor})")
    print(f"1日あたりの消費カロリー: {tdee:.1f} kcal")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n中断しました。")
