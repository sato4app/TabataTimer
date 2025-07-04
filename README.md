### Tabata Timer（疑似）
- 準備(Setup)、実施(WorkOut)、休憩(Rest)、セット数(Set Count)の4種の整数値を設定
- Setupは最初のみ、WorkOutとRestをSet Count数実施。
- Startで開始、Stopで終了。終了時には開始時の数値に値を戻す。

- 改善を要する点：
-- WorkOutとRestの値が、残が0になった後で開始時の数値に戻らない。
-- 終了時は開始時の値に戻したいが、設定の初期値(3, 5, 4, 3)になる。