export function exportBetsToCsv(bets, filename = '小元寶性別趴下注名單.csv', onError) {
  if (!bets || bets.length === 0) {
    if (onError) {
      onError('目前尚無下注資料可供匯出！');
    }
    return;
  }

  const format24hTime = (isoString) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  const BOM = '\uFEFF';
  const headers = ['下注時間(24H)', '姓名', '下注陣容', '下注金額', '付款狀態', '祝福留言'];

  const rows = bets.map(b => {
    const timeStr = format24hTime(b.createdAt);
    const teamName = b.team === 'prince' ? '👦 王子' : '👧 公主';
    const paidStr = b.isPaid ? '已付款 ✅' : '未付款 ⏳';
    const noteClean = `"${(b.note || '').replace(/"/g, '""')}"`;
    const nameClean = `"${(b.name || '').replace(/"/g, '""')}"`;

    return [
      timeStr,
      nameClean,
      teamName,
      `$${Number(b.amount).toLocaleString('en-US')}`,
      paidStr,
      noteClean
    ].join(',');
  });

  const csvContent = BOM + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
