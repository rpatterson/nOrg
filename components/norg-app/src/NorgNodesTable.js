import { LitElement, html } from 'lit-element';

import {MDCDataTable} from '@material/data-table';

import Node from '../../../src/nOrg.js';


export class NorgNodesTable extends LitElement {
  static get properties() {
    return {
      parentNode: { type: Node },
      firstNode: { type: Node },
     };
  }

  render() {
    return html`
      <link
           href="node_modules/@material/data-table/dist/mdc.data-table.css"
           rel="stylesheet" type="text/css" />

      <div class="mdc-data-table">
        <table class="mdc-data-table__table" aria-label="${this.parentNode.Subject} children">
          <thead>
            <tr class="mdc-data-table__header-row">
              <th
                 class="mdc-data-table__header-cell
                mdc-data-table__header-cell--checkbox" role="columnheader" scope="col">
                <div
                    class="mdc-checkbox mdc-data-table__header-row-checkbox mdc-checkbox--selected"> 
                  <input
                        type="checkbox"
                        class="mdc-checkbox__native-control"
                        aria-label="Select/unselect al children"/>
                </div>
              </th>
              <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                State
              </th>
              <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                Subject
              </th>
            </tr>
          </thead>
          <tbody class="mdc-data-table__content">
            ${this.__iterateNodes()}
          </tbody>
        </table>
      </div>
    `;
  }

  updated() {
    // eslint-disable-next-line no-new
    new MDCDataTable(this.shadowRoot.querySelector('.mdc-data-table'));
  }

  * __iterateNodes() {
    let node = this.firstNode;
    while (node) {
      yield html`
        <tr data-row-id="${node['Message-ID']}" class="mdc-data-table__row">
          <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
            <div class="mdc-checkbox mdc-data-table__row-checkbox">
              <input type="checkbox" class="mdc-checkbox__native-control"
                     aria-labelledby="${node['Message-ID']}"/>
            </div>
          </td>
          <td class="mdc-data-table__cell">${node["Node-State"]}</td>
          <td class="mdc-data-table__cell" id="${node['Message-ID']}">
            ${node.Subject}
          </td>
        </tr>
      `
      node = node.$nextSibling
    }
  }
  
}
