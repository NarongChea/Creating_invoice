# 📄 Invoice App — Setup Guide

## Folder Structure

```
invoice-app/
├── index.html       ← Main invoice page
├── style.css        ← All styling
├── script.js        ← Add rows, delete, PDF export
├── image1.png       ← Top-left collage image
├── image2.png       ← Top-right collage image
├── image3.png       ← Bottom-left collage image
├── image4.png       ← Bottom-right collage image
├── signature.png    ← Signature image
└── README.md        ← This file
```

## 🖼️ Images You Need to Add

Place these image files in the same folder as `index.html`:

| File Name       | Description                              |
|-----------------|------------------------------------------|
| `image1.png`    | Top-left photo in the 2×2 logo collage   |
| `image2.png`    | Top-right photo in the 2×2 logo collage  |
| `image3.png`    | Bottom-left photo in the 2×2 logo collage|
| `image4.png`    | Bottom-right photo in the 2×2 logo collage|
| `signature.png` | Signature image (shown on left sig block)|

> **Tip:** Images can be JPG or PNG. Just rename them to match the filenames above.

## ✏️ Editing the Invoice

- **Click on any text** to edit it directly (company name, customer, address, notes, prices, etc.)
- **＋ Add Row** — adds a new item row to the table
- **✕ button** on each row — deletes that row
- **＋ Add Note** — adds a new note line in the Notes section
- **Enter key** in a table cell — moves to the next row (adds a new row if at the end)

## 💾 Save as PDF

Click the **⬇ Save as PDF** button in the top toolbar. The PDF will be saved as `invoice.pdf`.

## 🌐 How to Open

Simply open `index.html` in any modern browser (Chrome, Edge, Firefox).
No server or installation needed.
