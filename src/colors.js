import colors from 'material-colors';

export const COLOR_VARIANTS = {
  light: [400, 500, 600, 700, 800, 900],
  dark: [300, 200, 100, 50],
};
// Get all the colors that have the variants
export const COLOR_KEYS = Object.keys(colors).filter(
  color => COLOR_VARIANTS.light.filter(
    variant => colors[color][variant] !== undefined).length);
export const PRIMARY_COLOR = 'purple';
export const SECONDARY_COLOR = 'teal';


export function* orderColors(primary = PRIMARY_COLOR, secondary = SECONDARY_COLOR, step) {
  let colorStep = step;
  if (!colorStep) {
    colorStep = COLOR_KEYS.indexOf(secondary) - COLOR_KEYS.indexOf(primary);
  }

  const colorKeys = Array.from(COLOR_KEYS);
  let index = colorKeys.indexOf(secondary)
  while (colorKeys.length) {

    /* Find the index of the next color that is `step` away,
     * looping around to the beginning if necessary */
    index += colorStep;
    while (index >= colorKeys.length) {
      index -= colorKeys.length;
    }

    yield colorKeys.splice(index, 1)[0];
  }
}
export const COLOR_ORDER = Array.from(orderColors())

export function orderColorVariants(order=COLOR_ORDER) {
  const variants = [];
  COLOR_VARIANTS.light.forEach(variant => order.forEach(color => 
    variants.push(colors[color][variant])));
  return variants;
}
const COLOR_VARIANT_ORDER = Array.from(orderColorVariants());
export default COLOR_VARIANT_ORDER;
