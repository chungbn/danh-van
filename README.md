# Bé Vui Đánh Vần

Web app học bảng chữ cái và tập đánh vần tiếng Việt cho bé chuẩn bị vào lớp 1.
Chỉ dùng HTML/CSS/JS thuần: không cần build, không cần cài gì thêm.

## Chạy

Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy một server tĩnh:

```sh
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

Giọng đọc dùng Web Speech Synthesis nên cần máy có giọng **Tiếng Việt**
(macOS/iOS: “Linh”; Windows: gói ngôn ngữ Tiếng Việt; Android: Google TTS; hoặc dùng trình duyệt Edge).
Nếu máy chưa có giọng này, app sẽ hiện hướng dẫn cài đặt.

## Giọng đọc thu sẵn

Chữ cái, âm đầu, vần, dấu thanh, từ có hình, lời khen và câu nhắc đều đã được thu sẵn
(`audio/clips/*.m4a`, khoảng 440 clip) bằng giọng “Linh” của macOS, nên đọc rõ và giống nhau trên mọi máy.
Các tiếng bé tự ghép ở mục Đánh vần vẫn đọc bằng giọng của máy. Nút ⚙️ dùng để chỉnh tốc độ đọc và chọn giọng.

Khi sửa dữ liệu trong `js/data.js`, chạy lại trên máy Mac để sinh các clip còn thiếu:

```sh
node tools/gen-audio.js            # thêm --force để sinh lại tất cả; RATE=140 để đọc chậm hơn
```

## Các mục

| Mục | Nội dung |
| --- | --- |
| Bảng chữ cái | 29 chữ cái, cách đọc theo sách lớp 1, hình SVG và từ ví dụ |
| Dấu thanh | 6 thanh, kèm hình minh hoạ và dãy luyện đọc (ma – má – mà – mả – mã – mạ) |
| Tập đánh vần | Ghép âm đầu + vần + dấu, đọc theo kiểu “bờ – a – ba – huyền – bà”; tự đặt dấu đúng chỗ và nhắc luật chính tả (c/k, g/gh, ng/ngh, vần p-t-c-ch) |
| Ôn vần | 19 bài theo “Bảng vần” lớp 1 (ia ua ưa … uynh uych). Mỗi bài: nghe từng vần, đánh vần tiếng ví dụ, 3 trò luyện tập (Nghe – chọn vần, Tìm vần trong tiếng, Điền vần), tuỳ chọn ôn gộp các bài trước; ★ cho mỗi trò đạt từ 6/8 |
| Tìm chữ | 3 chế độ: nghe tìm chữ, nghe tìm hình, nhìn hình chọn từ, có pháo hoa khi bé chọn đúng |
| Ghép từ | Kéo thả chữ vào ô trống (chuột và cảm ứng), 3 mức độ |
| Góc Bé Ngoan | Sao thưởng, 15 sticker thú hoạt hình mở khoá dần |

Tiến độ được lưu trong `localStorage` của trình duyệt.

## Cấu trúc

```
index.html
css/style.css
js/utils.js        helper DOM, lưu trữ, xử lý chính tả tiếng Việt (VN.compose, đặt dấu)
js/data.js         chữ cái, dấu thanh, âm đầu, vần, từ có hình, sticker
js/art.js          hình minh hoạ SVG
js/audio.js        Sound (Web Audio: hiệu ứng + nhạc nền) và Voice (clip thu sẵn → Speech Synthesis)
js/audio-clips.js  bảng tra văn bản → clip (tự sinh)
tools/gen-audio.js sinh clip bằng lệnh `say` của macOS
js/effects.js      pháo hoa, hoa giấy (canvas)
js/rewards.js      sao, tiến độ, mở khoá sticker
js/screens/*.js    từng màn hình (van.js: Ôn vần, dữ liệu ở VAN_LESSONS trong data.js)
js/app.js          điều hướng theo hash (#/chu-cai, #/danh-van, ...)
```
