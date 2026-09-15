# 海面底圖製作紀錄

- 工具：內建 imagegen，edit 模式（未使用 CLI/API fallback）。
- 輸入：`public/uploads/busan-coast.png`，唯讀保留。
- 產出：`public/uploads/busan-sea-underpaint.png`，1983×793 PNG，約 1.9 MiB。
- SHA-256：`682f1adc8854711e8ea09af6167bd3ebbd2010ef1bb7eb957020b67aefcf88ca`。
- 用途：只當海水遮罩內的固定底色，生成版本的橋／城市／陽傘／石頭不取代正式畫面上的原圖。
- 白色碎浪從原海岸插圖取紋理；無新增不同風格的浪花插圖。海鷗素材保持原位元。

## 實際生成 prompt

Use case: precise-object-edit. Create a clean ocean underpainting plate for layered 2D animation from this exact provided painted Busan coast illustration. Preserve the entire exact framing, aspect ratio 1983:793, camera, skyline, mountains, Gwangandaegyo bridge, sky and bird, both umbrellas, golden sand beach and rock formations, all at their identical positions. Only edit the WATER: remove ALL bright white breaking-wave foam and white spray from the ocean and replace those white water regions with continuous calm textured blue/turquoise sea, keeping the original gouache/screenprint paper grain, dry brush texture, blue palette and perspective. Keep mild painted blue water ripples but no white foam, no white surf lines, no splashes. The water should be deeper blue at the horizon, turquoise in foreground. Restore water texture naturally where foam was. Keep sand entirely intact up to its original edge and all dark rocks intact, only erase white splashes touching the rocks. This is an animation clean plate, not a new composition. Absolutely no new elements, no new text, no border, no different painting style. Keep it extremely faithful to the input. Output one full-width opaque RGB PNG.
