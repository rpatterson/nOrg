import { html, fixture, expect } from '@open-wc/testing';

import '../norg-app.js';

describe('NorgApp', () => {
  it('renders the nodes table', async () => {
      const el = await fixture(html`
        <norg-app></norg-app>
      `);

    expect(el.shadowRoot.querySelector('main')).lightDom.to.contain(
      'norg-nodes-table');
  });

  it('changes the page if a menu link gets clicked', async () => {
    const el = await fixture(html`
      <norg-app></norg-app>
    `);
    const drawer = el.shadowRoot.querySelector('mwc-drawer');
    const button = drawer.querySelector('mwc-icon-button');

    expect(drawer.open).to.be.false;

    button.click();
    expect(drawer.open).to.be.true;
  });

  it('matches the snapshot', async () => {
    const el = await fixture(html`
      <norg-app></norg-app>
    `);

    expect(el).shadowDom.to.equalSnapshot();
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`
      <norg-app></norg-app>
    `);

    await expect(el).shadowDom.to.be.accessible({ignoredRules: ['aria-allowed-role']});
  });
});
