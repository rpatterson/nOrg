import { expect } from '@open-wc/testing';

import * as colors from '../colors.js';


describe('colors', () => {

  it('generates color variants', () => {
    expect(colors.COLOR_ORDER[0]).to.equal('orange');
  });

  it('accepts a custom color step', () => {
    expect(Array.from(colors.orderColors(
      undefined, undefined, 4))[0]).to.equal('yellow');
  });

});
