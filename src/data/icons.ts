/**
 * SVG icons for campus POI markers.
 * Each icon uses a 24x24 viewBox, stroke-based line-art style with currentColor.
 */

export const SVG_ICONS: Record<string, string> = {
  教学楼: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M10 10h1"/><path d="M14 10h1"/><path d="M10 14h1"/><path d="M14 14h1"/></svg>`,

  教学区: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="17" r="1"/></svg>`,

  图书馆: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 19l5-2 5 2 5-2 5 2V5l-5 2-5-2-5 2-5-2z"/><path d="M7 5v14"/><path d="M12 7v12"/><path d="M17 5v14"/></svg>`,

  食堂: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,

  体育设施: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M7 21l3-7"/><path d="M10 14l5-5"/><path d="M15 9l3 3"/><path d="M10 14l-4-2"/><path d="M17 21l-2-7"/></svg>`,

  宿舍: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></svg>`,

  行政办公: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v3"/><path d="M2 12h20"/></svg>`,

  生活服务: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,

  出入口: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,

  地标: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

/** Fallback icon when the POI type is not recognised. */
const FALLBACK_ICON = SVG_ICONS['地标'];

/**
 * Build a complete map-marker HTML string for use as AMap `Marker` content.
 *
 * The marker consists of a coloured circle with the white icon centred inside,
 * plus a downward-pointing triangle "tail" beneath it.
 *
 * @param type   POI type key (e.g. "教学楼", "食堂")
 * @param color  CSS colour for the circle background (e.g. "#4285F4")
 * @param size   Diameter of the circle in px (default 36)
 */
export function createMarkerSvg(
  type: string,
  color: string,
  size: number = 36,
): string {
  const iconSvg = (SVG_ICONS[type] ?? FALLBACK_ICON)
    .replace('width="24"', `width="${size * 0.6}"`)
    .replace('height="24"', `height="${size * 0.6}"`)
    .replace('stroke="currentColor"', 'stroke="#fff"');

  const pointerHeight = Math.round(size * 0.3);
  const totalWidth = size;
  const totalHeight = size + pointerHeight;

  const pointerHalf = Math.round(size * 0.2);

  return `<div style="
    display:flex;flex-direction:column;align-items:center;
    width:${totalWidth}px;height:${totalHeight}px;
    cursor:pointer;position:relative;
  ">
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${iconSvg}</div>
    <svg width="${pointerHalf * 2}" height="${pointerHeight}" viewBox="0 0 ${pointerHalf * 2} ${pointerHeight}" style="margin-top:-1px;">
      <polygon points="0,0 ${pointerHalf * 2},0 ${pointerHalf},${pointerHeight}" fill="${color}"/>
    </svg>
  </div>`;
}
