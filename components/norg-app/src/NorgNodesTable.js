import { classMap } from "lit-html/directives/class-map";
import { LitElement, html, css } from "lit-element";

import { MDCDataTable } from "@material/data-table";
import "@material/mwc-button/mwc-button";

import COLOR_VARIANT_ORDER from "../../../src/colors.js";
import Node from "../../../src/nOrg.js";

function __expandCell(node) {
  if (node.$childHead) {
    const icon = node.$collapsed ? "expand_more" : "expand_less";
    return html`
      <mwc-icon-button icon="${icon}"></mwc-icon-button>
    `;
  }
  return null;
}

export default class NorgNodesTable extends LitElement {
  static get properties() {
    return {
      topNode: { type: Node },
      firstNode: { type: Node },

      colorOrder: { type: Array }
    };
  }

  static get styles() {
    return css`
      .norg-node-state-TODO .norg-node-state {
        --mdc-theme-primary: red;
      }
      .norg-node-state-DONE .norg-node-state {
        --mdc-theme-primary: green;
      }
      .norg-node-state-CANCELLED .norg-node-state {
        --mdc-theme-primary: green;
      }
    `;
  }

  constructor() {
    super();

    this.colorOrder = COLOR_VARIANT_ORDER;
  }

  render() {
    return html`
      <link
        href="node_modules/@material/data-table/dist/mdc.data-table.css"
        rel="stylesheet"
        type="text/css"
      />

      <div class="mdc-data-table">
        <table
          class="mdc-data-table__table"
          aria-label="${this.topNode.Subject} children"
        >
          <thead>
            <tr class="mdc-data-table__header-row">
              <th
                class="mdc-data-table__header-cell
                mdc-data-table__header-cell--checkbox"
                role="columnheader"
                scope="col"
              >
                <div
                  class="mdc-checkbox mdc-data-table__header-row-checkbox mdc-checkbox--selected"
                >
                  <input
                    type="checkbox"
                    class="mdc-checkbox__native-control"
                    aria-label="Select/unselect al children"
                  />
                </div>
              </th>
              <th
                class="mdc-data-table__header-cell"
                role="columnheader"
                scope="col"
              >
                <mwc-icon-button icon="unfold_more"> </mwc-icon-button>
              </th>
              <th
                class="mdc-data-table__header-cell"
                role="columnheader"
                scope="col"
              >
                State
              </th>
              <th
                class="mdc-data-table__header-cell"
                role="columnheader"
                scope="col"
              >
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
    new MDCDataTable(this.shadowRoot.querySelector(".mdc-data-table"));
  }

  *__iterateNodes() {
    let node = this.firstNode;
    while (node) {
      yield this.__generateNode(node);

      if (node.$childHead && !node.$collapsed) {
        node = node.$childHead;
      } else if (node.$nextSibling) {
        node = node.$nextSibling;
      } else {
        let parent = node.$parent;
        node = null;
        while (parent !== this.topNode) {
          if (parent.$nextSibling) {
            node = parent.$nextSibling;
            break;
          }
          parent = parent.$parent;
        }
      }
    }
  }

  __generateNode(node) {
    const depth = node.depth(this.topNode);
    const nodeClasses = {
      [`norg-node-state-${node["Node-State"]}`]: true,
      [`norg-node-depth-${depth}`]: true
    };

    return html`
      <tr
        data-row-id="${node["Message-ID"]}"
        class="mdc-data-table__row ${classMap(nodeClasses)}"
      >
        <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
          <div class="mdc-checkbox mdc-data-table__row-checkbox">
            <input
              type="checkbox"
              class="mdc-checkbox__native-control"
              aria-labelledby="${node["Message-ID"]}"
            />
          </div>
        </td>
        <td class="mdc-data-table__cell">
          ${__expandCell(node)}
        </td>
        <td class="mdc-data-table__cell">
          ${node["Node-State"]
            ? html`
                <mwc-button
                  dense
                  label="${node["Node-State"]}"
                  class="norg-node-state"
                >
                </mwc-button>
              `
            : null}
        </td>
        <td
          class="mdc-data-table__cell"
          id="${node["Message-ID"]}"
          style="color: ${this.colorOrder[depth - 1]};"
        >
          &bull;${Array.from(Array(depth - 1)).map(
            () =>
              html`
                &bull;
              `
          )}
          ${node.Subject}
        </td>
      </tr>
    `;
  }
}
