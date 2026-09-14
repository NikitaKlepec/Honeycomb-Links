const HEX_WIDTH = 150;

// clip-path карточки: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
// От 25% до 75% по высоте — полная ширина. Выше/ниже — сужается к вершине.
export function hexWidthPercentAtY(yPercent: number): number {
  const y = Math.max(0, Math.min(100, yPercent));
  if (y <= 25) return (y / 25) * 100;
  if (y >= 75) return ((100 - y) / 25) * 100;
  return 100;
}

// Безопасная максимальная ширина текста (в px) в зависимости от вертикальной
// позиции внутри соты. marginFactor оставляет отступ от диагональных граней.
export function hexTextMaxWidthPx(yPercent: number, marginFactor = 1.5): number {
  const widthPercent = hexWidthPercentAtY(yPercent);
  const raw = HEX_WIDTH * (widthPercent / 100) * marginFactor;
  return Math.max(40, raw);
}