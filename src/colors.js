import COLORS from 'material-colors';
import 'axe-core';

const {axe} = window;

export const THEME = {
  primary: 'purple',
  secondary: 'teal',
  error: 'red',
  background: 'white',
  surface: 'white',
  onPrimary: 'white',
  onSecondary: 'black',
  onBackground: 'black',
  onSurface: 'black',
  onError: 'white',
}

export const VARIANTS = {
  light: [400, 500, 600, 700, 800, 900],
  dark: [300, 200, 100, 50],
};

/**
 * Return the available colors not used in the theme
 */
export function filterAvailableColors(theme=THEME, colors=Object.keys(COLORS)) {
  const reserved = Object.values(theme);
  return colors.filter( color => !reserved.includes(color) );
}
export const AVAILABLE_COLORS = Array.from(filterAvailableColors());

/**
 * Order the available colors for use per-node depth level.
 *
 * Step over several colors such that next levels have enough contrast with each other
 * to be distinct.
 */
export const COLOR_STEP = (
  Object.keys(COLORS).indexOf(THEME.secondary) -
  Object.keys(COLORS).indexOf(THEME.primary));
export function* orderColors(
  availableColors=AVAILABLE_COLORS, startIndex=0, step=COLOR_STEP) {

  // Mutable array we can remove colors from as all their variants are consumed
  const colors = Array.from(availableColors);

  let index = startIndex;
  while (colors.length) {

    /* Find the index of the next color that is `step` away,
     * looping around to the beginning if necessary */
    index += step;
    while (index >= colors.length) {
      index -= colors.length;
    }

    yield colors.splice(index, 1)[0];
  }
}
export const COLOR_ORDER = Array.from(orderColors())

/**
 * Parse a "#......" color string into an Array of RGB values.
 */
export function parseHexColor(hexColor) {
  return [
    hexColor.substring(1, 3), hexColor.substring(3, 5), hexColor.substring(5)].map(
      hexDigit => parseInt(hexDigit, 16)
    );
}

/**
 * Order the variants with sufficient contrast for each ordered color in turn.
 */
export function orderColorVariants(
  colorOrder=COLOR_ORDER, background=COLORS[THEME.surface],
  fontSize="0.875rem", bold, variantsOrder=VARIANTS.light, colors=COLORS) {

  const backgroundParsed = new axe.commons.color.Color(...parseHexColor(background));

  /* Construct a mapping of {color: [variants...]}
     ordered by both color order and variant order */
  const colorVariantsOrder = Object.fromEntries(colorOrder.map(color => (
    [color, variantsOrder.filter(variant => {
      if (!Object.prototype.hasOwnProperty.call(colors[color], variant)) {
        return false;
      }

      const variantParsed = new axe.commons.color.Color(
        ...parseHexColor(colors[color][variant]));

      const contrast = axe.commons.color.hasValidContrastRatio(
        backgroundParsed, variantParsed, fontSize, bold);
      return contrast.isValid;
    }).map(variant => colors[color][variant])]
  )).filter(entry => entry[1].length > 0));

  const results = [];
  while (Object.keys(colorVariantsOrder).length !== 0) {
    Object.entries(colorVariantsOrder).forEach(([color, colorVariants]) => {
      results.push(colorVariants.splice(0, 1)[0]);
      if (colorVariants.length === 0) {
        delete colorVariantsOrder[color];
      }
    })
  }
  return results;
}
const COLOR_VARIANTS_ORDER = Array.from(orderColorVariants());
export default COLOR_VARIANTS_ORDER;
