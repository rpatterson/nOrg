# `NorgApp`

#### `matches the snapshot`

```html
<link
  href="node_modules/@material/layout-grid/dist/mdc.layout-grid.css"
  rel="stylesheet"
  type="text/css"
>
<link
  href="node_modules/@material/icon-button/dist/mdc.icon-button.css"
  rel="stylesheet"
  type="text/css"
>
<link
  href="node_modules/@material/drawer/dist/mdc.drawer.css"
  rel="stylesheet"
  type="text/css"
>
<link
  href="node_modules/@material/top-app-bar/dist/mdc.top-app-bar.css"
  rel="stylesheet"
  type="text/css"
>
<mwc-drawer
  hasheader=""
  type="dismissible"
>
  <span slot="title">
    nOrg Menu
  </span>
  <span slot="subtitle">
    TODO
  </span>
  <div slot="appContent">
    <mwc-top-app-bar-fixed
      dense=""
      id="bar"
    >
      <mwc-icon-button
        icon="menu"
        slot="navigationIcon"
      >
      </mwc-icon-button>
      <div
        id="title"
        slot="title"
      >
        My Projects
      </div>
    </mwc-top-app-bar-fixed>
    <div id="content">
      <main>
        <div class="mdc-layout-grid">
          <div class="mdc-layout-grid__inner">
            <div class="mdc-layout-grid__cell">
              <norg-nodes-table>
              </norg-nodes-table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</mwc-drawer>

```

