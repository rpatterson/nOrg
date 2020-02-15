import { html, fixture, expect } from '@open-wc/testing';

import '../norg-app.js';

describe('NorgApp', () => {
  it('has page "main" by default', async () => {
    const el = await fixture(html`
      <norg-app></norg-app>
    `);

    expect(el.shadowRoot.querySelector('main')).lightDom.to.equal(``);
  });

  it('renders default fallback content', async () => {
    const el = await fixture(html`
      <norg-app></norg-app>
    `);
    el.page = undefined;

    expect(el.shadowRoot.querySelector('main')).lightDom.to.equal(``);
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
