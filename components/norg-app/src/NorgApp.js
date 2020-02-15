import { LitElement, html } from 'lit-element';

import '@material/mwc-top-app-bar-fixed/mwc-top-app-bar-fixed';


export class NorgApp extends LitElement {
  render() {
    return html`
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
