import { LitElement, html } from 'lit-element';

import '@material/mwc-top-app-bar-fixed/mwc-top-app-bar-fixed';


export class NorgApp extends LitElement {
  render() {
    return html`
      <link
        href="node_modules/@material/top-app-bar/dist/mdc.top-app-bar.css"
        rel="stylesheet" type="text/css" />

      <mwc-top-app-bar-fixed id="bar" dense="">
        <mwc-icon-button icon="menu" slot="navigationIcon"></mwc-icon-button>
        <div slot="title" id="title">nOrg</div>
        <div id="content">
          <main>
          </main>
        </div>
      </mwc-top-app-bar-fixed>
    `;
  }
}
