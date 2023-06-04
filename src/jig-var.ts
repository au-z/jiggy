import { getset } from '@auzmartist/hybrids-helpers'
import { define, html, parent } from 'hybrids'
import { produce } from 'immer'
import '@auzmartist/cam-el/button'
import '@auzmartist/cam-el/icon'

export interface JigVarElement extends HTMLElement {
  [key: string]: any
}

type H = JigVarElement

export const JigVar = define<H>({
  tag: 'jig-var',
  ctx: parent((el) => el.tag === 'jig-block'),
  vars: getset([]),
  componentStyles: ({ ctx }) => ctx?.component?.getStyles(),
  render: (h: H) =>
    html`${h.ctx?.vars?.map(
      (v) => html`<div class="field">
        <label><pre>--${v}</pre></label>
        <input type="text" value="${h.vars[v] ?? ''}" oninput="${(host, e) => setVar(host, e, v)}" />
        <cam-button type="tech" onclick="${(host, e) => deleteVar(host, e, v)}"><cam-icon>close</cam-icon></cam-button>
      </div>`
    )}`.css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-rows: auto;
      grid-column-gap: 0rem;
      grid-row-gap: 0.25rem;
      justify-items: flex-start;
      align-items: center;
      overflow: auto;
    }
    :host > .field {
      display: contents;
    }
    cam-button[type='tech'] {
      --color: #e98f73;
    }
    :host label {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0 0.5rem 0 0;
      padding-left: 0.5rem;
      background: var(--jig-prop-label-background, rgba(255, 255, 255, 0.2));
      border-top-left-radius: var(--jig-prop-border-radius, 0.25rem);
      border-bottom-left-radius: var(--jig-prop-border-radius, 0.25rem);
    }
    label > pre {
      margin: 0;
    }
    :host input,
    :host textarea {
      background: var(--jig-prop-background, transparent);
      border: var(--jig-prop-border, 1px solid #666);
      color: var(--jig-prop-color, #e7e7e7);
      padding: var(--jig-prop-padding, 0.3rem);
      border-top-right-radius: var(--jig-prop-border-radius, 0.25rem);
      border-bottom-right-radius: var(--jig-prop-border-radius, 0.25rem);
      font-family: monospace;
    }

    /* scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px grey;
      border-radius: 10px;
    }
    ::-webkitp-scrollbar-thumb {
      background: #666;
      border-radius: 10px;
    }
    `,
})

function setVar(host: H, e, name: string) {
  host.vars = produce(host.vars, (draft) => {
    draft[name] = e.target.value
  })
  host.ctx?.component?.style.setProperty(`--${name}`, host.vars[name])
}

function deleteVar(host: H, e, name: string) {
  host.vars = produce(host.vars, (draft) => {
    delete draft[name]
  })
  host.ctx?.component?.style.removeProperty(`--${name}`)
}
