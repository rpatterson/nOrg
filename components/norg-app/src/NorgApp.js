import { LitElement, html } from 'lit-element';

import '@material/mwc-drawer/mwc-drawer';
import '@material/mwc-icon-button/mwc-icon-button';
import '@material/mwc-top-app-bar-fixed/mwc-top-app-bar-fixed';

import Node, {defaults} from '../../../src/nOrg.js';
import json from '../../../src/nOrg-nodes.js';


function __onMenuClicked(event) {
  const drawer = event.target.closest('mwc-drawer');
  drawer.open = !drawer.open;
}


export class NorgApp extends LitElement {
  static get properties() {
    return {
      root: { type: Node },
     };
  }

  constructor() {
    super();

    this.root = defaults.newRoot(json);
  }

  render() {
    return html`
      <link
           href="node_modules/@material/layout-grid/dist/mdc.layout-grid.css"
           rel="stylesheet" type="text/css" />
      <link
           href="node_modules/@material/icon-button/dist/mdc.icon-button.css"
           rel="stylesheet" type="text/css" />
      <link
           href="node_modules/@material/drawer/dist/mdc.drawer.css"
           rel="stylesheet" type="text/css" />
      <link
           href="node_modules/@material/top-app-bar/dist/mdc.top-app-bar.css"
           rel="stylesheet" type="text/css" />

      <mwc-drawer hasheader type="dismissible">
        <span slot="title">nOrg Menu</span>
        <span slot="subtitle">TODO</span>
        <div slot="appContent">
          <mwc-top-app-bar-fixed id="bar" dense="">
            <mwc-icon-button
                icon="menu" slot="navigationIcon"
                @click=${__onMenuClicked}>
            </mwc-icon-button>
            <div slot="title" id="title">${this.root.Subject}</div>
          </mwc-top-app-bar-fixed>
          <div id="content">
            <main>
              <div class="mdc-layout-grid">
                <div class="mdc-layout-grid__inner">
                  <div class="mdc-layout-grid__cell">
                    <norg-nodes-table
                      .parentNode="${this.root}"
                      .firstNode="${this.root.$childHead}">
                    </norg-nodes-table>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </mwc-drawer>
    `;
  }

}
