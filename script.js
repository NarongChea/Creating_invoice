/* ============================================================
   INVOICE APP — script.js
   ============================================================ */

/* ---------- Row helpers ---------- */
function getNextRowNumber() {
  return document.querySelectorAll('#table-body tr').length + 1;
}

function addRow() {
  const tbody = document.getElementById('table-body');
  const rowNum = getNextRowNumber();
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="tc-no" contenteditable="true">${rowNum}</td>
    <td class="tc-content khmer" contenteditable="true"></td>
    <td class="tc-size" contenteditable="true"></td>
    <td class="tc-price" contenteditable="true"></td>
    <td class="tc-act no-print"><button class="del-btn" onclick="deleteRow(this)">✕</button></td>
  `;
  tbody.appendChild(tr);
  tr.querySelector('.tc-content').focus();
}

function deleteRow(btn) {
  btn.closest('tr').remove();
  renumberRows();
}

function renumberRows() {
  document.querySelectorAll('#table-body tr').forEach((row, i) => {
    const c = row.querySelector('.tc-no');
    if (c) c.textContent = i + 1;
  });
}

/* ---------- Notes ---------- */
function addNote() {
  const list = document.getElementById('notes-list');
  const count = list.querySelectorAll('.note').length + 1;
  const p = document.createElement('p');
  p.className = 'note khmer';
  p.contentEditable = 'true';
  p.textContent = `${count}. `;
  list.appendChild(p);
  p.focus();
  const r = document.createRange(), s = window.getSelection();
  r.selectNodeContents(p); r.collapse(false);
  s.removeAllRanges(); s.addRange(r);
}

/* ---------- Customer modal ---------- */
function openCustomerModal() {
  document.getElementById('f-customer').value = document.getElementById('d-customer').textContent.trim();
  document.getElementById('f-contact').value  = document.getElementById('d-contact').textContent.trim();
  document.getElementById('f-address').value  = document.getElementById('d-address').textContent.trim();
  document.getElementById('f-quoteno').value  = document.getElementById('d-quoteno').textContent.trim();
  document.getElementById('f-date').value     = document.getElementById('d-date').textContent.trim();
  document.getElementById('customerModal').classList.add('open');
}

function closeCustomerModal() {
  document.getElementById('customerModal').classList.remove('open');
}

function closeIfOverlay(e) {
  if (e.target === document.getElementById('customerModal')) closeCustomerModal();
}

function applyCustomer() {
  document.getElementById('d-customer').textContent = document.getElementById('f-customer').value;
  document.getElementById('d-contact').textContent  = document.getElementById('f-contact').value;
  document.getElementById('d-address').textContent  = document.getElementById('f-address').value;
  document.getElementById('d-quoteno').textContent  = document.getElementById('f-quoteno').value;
  document.getElementById('d-date').textContent     = document.getElementById('f-date').value;
  closeCustomerModal();
}

/* ---------- Save as PDF (canvas snapshot → preserves Khmer) ---------- */
async function saveAsPDF() {
  const btn = document.getElementById('savebtn');
  btn.textContent = '⏳ Generating…';
  btn.disabled = true;

  // Hide UI-only elements
  document.querySelectorAll('.no-print').forEach(el => {
    el.dataset.prevDisplay = el.style.display;
    el.style.display = 'none';
  });
  document.querySelector('.page-wrapper').style.paddingTop = '0';

  const invoice = document.getElementById('invoice');

  try {
    // Wait for fonts to be fully loaded
    await document.fonts.ready;

    // Render invoice to canvas at 2× for crisp output
    const canvas = await html2canvas(invoice, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      // Give extra time for font rendering
      onclone: (doc) => {
        return new Promise(resolve => setTimeout(resolve, 200));
      }
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const pageW = pdf.internal.pageSize.getWidth();   // 210
    const pageH = pdf.internal.pageSize.getHeight();  // 297

    const imgW  = canvas.width;
    const imgH  = canvas.height;

    // Scale to fit A4 width with small margins
    const margin  = 5;
    const printW  = pageW - margin * 2;
    const printH  = imgH * (printW / imgW);

    // If taller than one page, split across pages
    if (printH <= pageH - margin * 2) {
      pdf.addImage(canvas, 'PNG', margin, margin, printW, printH, '', 'FAST');
    } else {
      // Multi-page: slice canvas
      const mmPerPx = printW / imgW;
      const sliceH  = Math.floor((pageH - margin * 2) / mmPerPx); // px per page
      let yOffset   = 0;

      while (yOffset < imgH) {
        const slice = document.createElement('canvas');
        slice.width  = imgW;
        slice.height = Math.min(sliceH, imgH - yOffset);
        const ctx = slice.getContext('2d');
        ctx.drawImage(canvas, 0, -yOffset);

        const sliceH_mm = slice.height * mmPerPx;
        pdf.addImage(slice, 'PNG', margin, margin, printW, sliceH_mm, '', 'FAST');
        yOffset += sliceH;
        if (yOffset < imgH) pdf.addPage();
      }
    }

    pdf.save('invoice.pdf');
  } finally {
    // Restore
    document.querySelectorAll('.no-print').forEach(el => {
      el.style.display = el.dataset.prevDisplay || '';
    });
    document.querySelector('.page-wrapper').style.paddingTop = '';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Save as PDF';
    btn.disabled = false;
  }
}

/* ---------- Set today's date ---------- */
(function setDate() {
  const el = document.getElementById('d-date');
  if (el && !el.textContent.trim()) {
    const n = new Date();
    const d = String(n.getDate()).padStart(2,'0');
    const m = String(n.getMonth()+1).padStart(2,'0');
    const y = String(n.getFullYear()).slice(2);
    el.textContent = `${d}-${m}-${y}`;
  }
})();

/* ---------- Enter key moves between table cells ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.closest('#items-table td')) {
    e.preventDefault();
    const td  = e.target.closest('td');
    const tr  = td.closest('tr');
    const idx = Array.from(tr.children).indexOf(td);
    const next = tr.nextElementSibling;
    if (next) {
      const cell = next.children[idx];
      if (cell && cell.contentEditable === 'true') cell.focus();
    } else {
      addRow();
    }
  }
});

/* ---------- ESC closes modal ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCustomerModal();
});
function saveForMobile() {
  // Hide buttons or UI before printing
  document.querySelectorAll('.no-print').forEach(el => {
    el.style.display = 'none';
  });

  // Trigger phone print (user can choose "Save as PDF")
  window.print();

  // Show back UI after print
  setTimeout(() => {
    document.querySelectorAll('.no-print').forEach(el => {
      el.style.display = '';
    });
  }, 1000);
}