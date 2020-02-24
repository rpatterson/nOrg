import { html, fixture, expect } from "@open-wc/testing";

import { defaults } from "../../../src/nOrg.js";
import json from "../../../src/nOrg-nodes.js";
import "../norg-app.js";

describe("NorgNodesTable", () => {
  const topNode = defaults.newTop(json);

  it("renders the nodes rows", async () => {
    const el = await fixture(html`
      <norg-nodes-table
        .topNode="${topNode}"
        .firstNode="${topNode.$childHead}"
      ></norg-nodes-table>
    `);

    expect(el.shadowRoot.querySelector("tbody")).lightDom.to.contain("tr");
  });

  it("renders the expand button conditionally", async () => {
    topNode.$childHead.$nextSibling.$collapsed = false;
    topNode.$childHead.$nextSibling.$childHead.$collapsed = false;
    topNode.$childHead.$nextSibling.$childHead.$childHead.$collapsed = false;
    const el = await fixture(html`
      <norg-nodes-table
        .topNode="${topNode}"
        .firstNode="${topNode.$childHead}"
      ></norg-nodes-table>
    `);

    expect(el.shadowRoot.querySelector("tbody")).lightDom.to.contain(
      "mwc-icon-button[icon='expand_less']"
    );
  });
});
