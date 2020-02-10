import { LitElement, html } from 'lit-element';


export class NorgApp extends LitElement {
  static get properties() {
    return {
      title: { type: String },
    };
  }

  render() {
    return html`
      <main>
      </main>
    `;
  }
}
