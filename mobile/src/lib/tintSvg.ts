/** Figma icons are exported in white; recolor one so it stays visible on the light glass panels. */
export const tintSvg = (xml: string, color: string) => xml.replaceAll('"white"', `"${color}"`);
