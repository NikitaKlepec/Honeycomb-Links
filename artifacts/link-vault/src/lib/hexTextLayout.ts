const HEX_WIDTH = 150;
const HEX_TEXT_MARGIN_PX = 12;

// clip-path карточки: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
// От 25% до 75% по высоте — полная ширина. Выше/ниже — сужается к вершине.
export function hexWidthPercentAtY(yPercent: number): number {
  const y = Math.max(0, Math.min(100, yPercent));
  if (y <= 25) return (y / 25) * 100;
  if (y >= 75) return ((100 - y) / 25) * 100;
  return 100;
}

// Безопасная максимальная ширина текста (в px) в зависимости от вертикальной
// позиции внутри соты. Ширина не зависит от горизонтальной позиции текста.
export function hexTextMaxWidthPx(yPercent: number, marginPx = HEX_TEXT_MARGIN_PX): number {
  const widthPercent = hexWidthPercentAtY(yPercent);
  const raw = HEX_WIDTH * (widthPercent / 100) - marginPx;
  return Math.max(40, Math.min(HEX_WIDTH - 8, raw));
}

export function hexTextHorizontalBoundsPercent(
  yPercent: number,
  textWidthPx: number,
  containerWidthPx: number,
  marginPx = 4,
) {
  if (containerWidthPx <= 0) return { min: 0, max: 100 };

  const hexWidthPx = containerWidthPx * (hexWidthPercentAtY(yPercent) / 100);
  const hexLeftPx = (containerWidthPx - hexWidthPx) / 2 + marginPx;
  const hexRightPx = containerWidthPx - hexLeftPx;
  const halfTextWidthPx = Math.min(textWidthPx / 2, Math.max(0, (hexRightPx - hexLeftPx) / 2));
  const minCenterPx = hexLeftPx + halfTextWidthPx;
  const maxCenterPx = hexRightPx - halfTextWidthPx;

  if (minCenterPx >= maxCenterPx) return { min: 50, max: 50 };

  return {
    min: (minCenterPx / containerWidthPx) * 100,
    max: (maxCenterPx / containerWidthPx) * 100,
  };
}