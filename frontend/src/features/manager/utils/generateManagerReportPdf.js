/**
 * Generates and prints/saves a styled A4 PDF report aligned with the Acrea Design System
 * using a hidden iframe so popup blockers never interfere and app chrome is excluded.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReportHtml(report) {
  const generatedAt = report.generatedAt
    ? new Date(report.generatedAt).toLocaleString()
    : new Date().toLocaleString();

  const cropRows = (report.cropBreakdown || []).length > 0
    ? report.cropBreakdown.map((crop) => `
      <tr>
        <td style="font-weight:600;color:#19201C;">${escapeHtml(crop.cropName)}</td>
        <td class="num">${Number(crop.yieldKg || 0).toLocaleString()} kg</td>
        <td class="num" style="font-weight:700;color:#3E7B52;">${escapeHtml(crop.yieldTons)} t</td>
        <td class="num">${Number(crop.cyclesCount || 0)}</td>
        <td>
          <div class="share-wrap">
            <div class="share-track">
              <div class="share-fill" style="width:${Math.min(100, Math.max(0, Number(crop.sharePercent || 0)))}%;"></div>
            </div>
            <span class="share-label">${escapeHtml(crop.sharePercent)}%</span>
          </div>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" class="empty">No crop harvest records recorded during this period.</td></tr>`;

  const farmerRows = (report.farmerBreakdown || []).length > 0
    ? report.farmerBreakdown.map((f) => {
      const cropsHtml = (f.crops || []).length > 0
        ? f.crops.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join('')
        : `<span class="muted">—</span>`;
      return `
        <tr>
          <td>
            <div style="font-weight:600;color:#19201C;">${escapeHtml(f.farmerName)}</div>
            <div class="sub">${escapeHtml(f.farmName || '—')}</div>
          </td>
          <td>${escapeHtml(f.location || '—')}</td>
          <td><div class="chips">${cropsHtml}</div></td>
          <td class="num">${Number(f.plotsCount || 0)}</td>
          <td class="num" style="color:#2E7D32;font-weight:600;">${Number(f.activeCycles || 0)}</td>
          <td class="num">${Number(f.completedCycles || 0)}</td>
          <td class="num">
            <div style="font-weight:700;color:#3E7B52;">${escapeHtml(f.harvestedTons)} t</div>
            <div class="sub">${Number(f.harvestedKg || 0).toLocaleString()} kg</div>
          </td>
        </tr>
      `;
    }).join('')
    : `<tr><td colspan="7" class="empty">No farmer output records available for the selected criteria.</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Acrea Consolidated Report - ${escapeHtml(report.reportId || 'Summary')}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #19201C;
      background: #FFFFFF;
      line-height: 1.45;
      font-size: 11px;
    }
    .header {
      background: #164230;
      color: #FFFFFF;
      padding: 20px 24px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand-tag {
      font-size: 8.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.72);
    }
    .report-title {
      font-size: 19px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    .report-meta {
      font-size: 10.5px;
      color: rgba(255, 255, 255, 0.85);
    }
    .header-right {
      text-align: right;
      flex-shrink: 0;
    }
    .report-id-pill {
      display: inline-block;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 6px;
    }
    .gen-label {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .gen-value {
      font-size: 10.5px;
      font-weight: 600;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .kpi-card {
      background: #F4EFE6;
      border: 1px solid #ECE7DC;
      border-radius: 10px;
      padding: 12px 14px;
      break-inside: avoid;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #788680;
    }
    .kpi-value {
      font-size: 18px;
      font-weight: 700;
      margin-top: 4px;
      letter-spacing: -0.02em;
    }
    .kpi-sub {
      font-size: 9.5px;
      color: #4B5752;
      margin-top: 2px;
    }
    .section {
      border: 1px solid #ECE7DC;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 16px;
      background: #FFFFFF;
    }
    .section-head {
      padding: 11px 14px;
      background: #F9F6F0;
      border-bottom: 1px solid #ECE7DC;
    }
    .section-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #19201C;
    }
    .section-sub {
      font-size: 10px;
      color: #788680;
      margin-top: 1px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #F4EFE6;
      color: #4B5752;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #ECE7DC;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #ECE7DC;
      vertical-align: middle;
      color: #4B5752;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr {
      break-inside: avoid;
    }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    th.num {
      text-align: right;
    }
    .sub {
      font-size: 9.5px;
      color: #788680;
    }
    .empty {
      text-align: center;
      padding: 20px;
      color: #788680;
    }
    .share-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .share-track {
      flex: 1;
      height: 7px;
      background: #ECE7DC;
      border-radius: 9999px;
      overflow: hidden;
    }
    .share-fill {
      height: 100%;
      background: #3E7B52;
      border-radius: 9999px;
    }
    .share-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #19201C;
      width: 34px;
      text-align: right;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .chip {
      background: #EAF4ED;
      border: 1px solid #C8E2D0;
      color: #285336;
      font-size: 9px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 9999px;
    }
    .footer {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #ECE7DC;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #788680;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="9" fill="#3E7B52"/>
          <path d="M18 7L27 27H22.2L18 17.5L13.8 27H9L18 7Z" fill="#FFFFFF"/>
          <circle cx="18" cy="24.5" r="2.2" fill="#FBBF24"/>
        </svg>
        <div>
          <div class="brand-name">Acrea</div>
          <div class="brand-tag">Cooperative Supervision</div>
        </div>
      </div>
      <div class="report-title">Consolidated Multi-Farmer Production Report</div>
      <div class="report-meta">
        Period: <strong>${escapeHtml(report.startDate)}</strong> to <strong>${escapeHtml(report.endDate)}</strong>
        &nbsp;·&nbsp; Covering <strong>${Number(report.totalFarmersCount || 0)}</strong> supervised farmer(s)
      </div>
    </div>
    <div class="header-right">
      <div class="report-id-pill">${escapeHtml(report.reportId || 'REPORT')}</div>
      <div class="gen-label">Generated at</div>
      <div class="gen-value">${escapeHtml(generatedAt)}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Production</div>
      <div class="kpi-value" style="color:#3E7B52;">${escapeHtml(report.totalYieldTons)} <span style="font-size:11px;">Tons</span></div>
      <div class="kpi-sub">${Number(report.totalYieldKg || 0).toLocaleString()} kg harvested</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Cultivated Area</div>
      <div class="kpi-value">${escapeHtml(report.totalCultivatedAreaHa)} <span style="font-size:11px;">ha</span></div>
      <div class="kpi-sub">Across ${Number(report.totalPlotsCount || 0)} plot(s)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Cycles Performance</div>
      <div class="kpi-value" style="color:#D97706;">${Number(report.totalActiveCycles || 0)} <span style="font-size:11px;">active</span></div>
      <div class="kpi-sub">${Number(report.totalCompletedCycles || 0)} completed</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Farm Inputs Spend</div>
      <div class="kpi-value">$${Number(report.totalInputsCost || 0).toLocaleString()}</div>
      <div class="kpi-sub">${Number(report.totalIncidentsCount || 0)} incident(s) recorded</div>
    </div>
  </div>

  <div class="section">
    <div class="section-head">
      <div class="section-title">Crop Production Breakdown</div>
      <div class="section-sub">Yield distribution and volume share across all harvested crops</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Crop Name</th>
          <th class="num">Yield (Kg)</th>
          <th class="num">Yield (Tons)</th>
          <th class="num">Cycles</th>
          <th style="width:170px;">Production Share (%)</th>
        </tr>
      </thead>
      <tbody>${cropRows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-head">
      <div class="section-title">Individual Farmer Performance Breakdown</div>
      <div class="section-sub">Per-farmer contribution to total cooperative volume</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Farmer</th>
          <th>Location</th>
          <th>Crops</th>
          <th class="num">Plots</th>
          <th class="num">Active</th>
          <th class="num">Done</th>
          <th class="num">Total Yield</th>
        </tr>
      </thead>
      <tbody>${farmerRows}</tbody>
    </table>
  </div>

  <div class="footer">
    <span>Acrea Agricultural Platform · Consolidated Cooperative Statement</span>
    <span>Report ID: ${escapeHtml(report.reportId || '—')}</span>
  </div>
</body>
</html>`;
}

export function generateManagerReportPdf(report) {
  if (!report) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(buildReportHtml(report));
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      cleanup();
    }
  }, 250);
}

