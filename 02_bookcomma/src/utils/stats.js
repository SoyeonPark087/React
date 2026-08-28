export function buildRegionStats(bookstores) {
  const map = new Map();
  bookstores.forEach((item) => {
    const region = item.shortRegion || '기타';
    if (!map.has(region)) map.set(region, { region, total:0, parking:0, independent:0, rental:0 });
    const row = map.get(region);
    row.total += 1;
    if (item.parking === true) row.parking += 1;
    if (item.independentPublishing === true) row.independent += 1;
    if (item.rental === true) row.rental += 1;
  });
  return [...map.values()]
    .map((row) => ({
      ...row,
      parkingRate: row.total ? Math.round((row.parking / row.total) * 100) : 0,
      independentRate: row.total ? Math.round((row.independent / row.total) * 100) : 0,
      rentalRate: row.total ? Math.round((row.rental / row.total) * 100) : 0,
    }))
    .sort((a,b) => b.total - a.total || a.region.localeCompare(b.region, 'ko'));
}
