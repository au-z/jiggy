import { getset, set } from '@auzmartist/hybrids-helpers'
import { Descriptor, define, html } from 'hybrids'
import { produce } from 'immer'
import styles from './jig-block.css?inline'
import '@auzmartist/cam-el/button'
import '@auzmartist/cam-el/icon'

export interface JigBlock extends HTMLElement {
  _components: HTMLElement[]
  component: HTMLElement
  props: string
  events: string[]
  mode: 'dark' | 'light'
  size: string[]

  id: string
  log: Event[]
  vars: string[]
  slots: HTMLElement[]
  activeSlots: boolean
  error: string

  _props: Record<string, { value: any; [key: string]: any }>
  _height: number

  renderProp: Function
}
type H = JigBlock

const JigBlock = define<H>({
  tag: 'jig-block',
  id: '',
  _components: child((host, el) => true),
  component: {
    get: ({ _components }) => _components[0],
    observe: (host, val, last) => {
      console.log('component', val, last)
      host.id = val?.tagName.toLowerCase()
      host.error = !val ? 'No component found' : ''
    },
  },
  error: '',
  props: '',
  _props: {
    get: (host, val) => val,
    set: ({ props, component }: H, val) => {
      // prettier-ignore
      const propList = props.trim().split(/,?\s+/gi).filter((p) => p)
      return (
        val ??
        propList.reduce((map, key) => {
          const value = component?.[key]
          map[key] = { value, type: typeof value }
          return map
        }, {})
      )
    },
    observe: (host: H, val: Record<string, { value: any; [key: string]: any }>) => {
      Object.entries(val).forEach(([key, config]) => {
        if (host.component) {
          host.component[key] = config.value
        }
      })
    },
  },
  events: {
    // prettier-ignore
    set: (host, val = '') => val.trim().split(/,?\s+/gi).filter((e) => e),
    connect: (host, key) => {
      const logEvent = (e: Event) => {
        if (host.log[0]?.timeStamp !== e.timeStamp) {
          host.log.splice(0, 0, e)
          host.log = [...host.log]
        }
      }

      const listeners = host[key]?.map((event) => host.addEventListener(event, logEvent))
      return () => {
        listeners?.forEach((listener) => host.removeEventListener(listener, logEvent))
      }
    },
  },
  log: getset([]),
  mode: {
    ...getset('dark'),
    observe: (host, val) => {
      host.setAttribute('theme', val)
    },
  },
  // prettier-ignore
  vars: set('', (host, val = '') => val.trim().split(/,?\s+/gi).filter((e) => e)),
  // prettier-ignore
  size: set('', (host, val) => val.trim().split(/,?\s+/gi).filter((e) => e)),
  slots: child((host, el) => el.tagName !== 'JIG-BLOCK' && el.tagName.indexOf('JIG-') === 0),
  activeSlots: ({ slots }) => slots.length > 0,
  render: (h: H) =>
    html`<div class="header">
        ${!h.error
          ? html`<a href="#${h.id}" onclick="${copyLink}" title="Copy Link">
              <cam-icon>link</cam-icon>&nbsp;
              <pre>&lt;${h.component?.tagName.toLowerCase()}&gt;</pre>
            </a>`
          : html`<span class="error">${h.error}</span>`}

        <cam-button
          type="tech"
          class="${h.mode}"
          onclick="${(host) => (host.mode = host.mode === 'dark' ? 'light' : 'dark')}"
        >
          <cam-icon>${`${h.mode === 'dark' ? 'light' : 'dark'}_mode`}</cam-icon>
        </cam-button>
      </div>
      <div class="block">
        <div class="content">
          <slot></slot>
        </div>
        <div class="props">
          ${Object.entries(h._props).map(
            ([prop, config]) => html`
              <div class="prop">
                <label title="${config.type}" for="${prop}">${prop}</label>
                ${h.renderProp(prop, config)}
              </div>
            `
          )}
        </div>
      </div>
      <div class="${{ slots: true, active: h.activeSlots }}">
        <slot name="log"></slot>
        <slot name="var"></slot>
      </div>`.css`
        :host {
          grid-template-columns: ${h.activeSlots ? 'auto minmax(0, 1fr)' : 'auto'};
          justify-items: ${h.activeSlots ? 'start' : 'center'};
        }
        .slots {
          height: ${h._height}px;
        }
        .content {
          width: ${h.size[0] || 'auto'};
          height: ${h.size[1] || 'auto'};
        }
      `.style(styles),
  // prettier-ignore
  renderProp: (h: H) => (prop: string, { value, type }) =>
      type === 'string' || type === 'number'
    ? html` <input type="${type === 'string' ? 'text' : 'number'}" value="${value}"
        oninput="${(host, e) => updateProp(host, prop, type, e)}" />
        <cam-button type="tech" onclick="${(host, e) => clearProp(host, prop, type)}"><cam-icon>close</cam-icon></cam-button> `
    : type === 'boolean'
    ? html` <input type="checkbox" checked="${value}"
        oninput="${(host, e) => updateProp(host, prop, type, e)}" /><i></i>`
    : type === 'object'
    ? html` <textarea style="grid-column: 2 / 4" value="${JSON.stringify(value)}"
        spellcheck="false"
        onchange="${(host, e) => updateProp(host, prop, type, e)}"></textarea>`
    : html`Unknown prop type`,
  _height: {
    ...getset(0),
    connect: ro(([entry]) => entry.contentRect.height, {
      ref: '.block',
    }),
  },
})

function copyLink(host, e) {
  let anchorHref = e.target.href
  if (!(e.target instanceof HTMLAnchorElement)) {
    anchorHref = e.target.parentElement.href
  }
  // add e.target.href to clipboard
  window.navigator.clipboard.writeText(anchorHref)
}

export function ro<E, T>(
  observer: (entries: ResizeObserverEntry[], val) => T,
  {
    ref,
  }: {
    ref?: string
  } = {}
): Descriptor<E, T>['connect'] {
  return (host, key, invalidate) => {
    const el = !ref ? host : host.render().querySelector(ref)
    const ro = new ResizeObserver((entries) => {
      host[key] = observer(entries, host[key])
      invalidate()
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }
}

function updateProp(host: H, prop: string, type: 'boolean' | 'number' | 'string' | 'object', e: Event) {
  const next = parseInputValue(e.target as any, type, host._props[prop].value)

  host._props = produce(host._props, (draft) => {
    draft[prop].value = next
  })
}

function clearProp(host: H, prop: string, type: 'boolean' | 'number' | 'string' | 'object') {
  host._props = produce(host._props, (draft) => {
    draft[prop].value = type === 'string' ? '' : type === 'number' ? 0 : type === 'boolean' ? false : {}
  })
}

// utility functions

function parseInputValue<T extends 'boolean' | 'string' | 'number' | 'object'>(
  el: T extends 'object' ? HTMLTextAreaElement : HTMLInputElement,
  type: T,
  fallback: any
): T extends 'string' ? string : T extends 'number' ? number : T extends 'boolean' ? boolean : object {
  const inputValue = type === 'boolean' ? (<HTMLInputElement>el).checked : el.value
  let result = null
  if (type === 'object') {
    try {
      result = JSON.parse(el.value)
    } catch {
      // allow empty string as empty object
      if (inputValue === '') {
        result = Array.isArray(fallback) ? [] : {}
        el.value = JSON.stringify(result)
      } else {
        // if invalid JSON, preserve value
        result = fallback
      }
    }
  } else {
    result = inputValue
  }
  return result
}

// interesting extension of reactivity
// connect: (host, key, invalidate) => {
//   const map = host[key]
//   host[key] = new Proxy(map, {
//     get(target, prop, receiver) {
//       var value = Reflect.get(target, prop, receiver)
//       // overload set to invalidate on invocation
//       if (prop === 'set' && typeof value === 'function') {
//         const origSet = value
//         value = function (key, value) {
//           console.log('invalidate')
//           invalidate()
//           // bind map to this
//           return origSet.apply(map, arguments)
//         }
//       }
//       // bind to wrapped map
//       return value.bind(map)
//     },
//   })
// },

function walk(node, fn, options, items = [], host = node) {
  for (const child of Array.from(node.children)) {
    if (fn(host, child)) {
      items.push(child)
      if (options.deep && options.nested) {
        walk(child, fn, options, items, host)
      }
    } else if (options.deep) {
      walk(child, fn, options, items, host)
    }
  }

  return items
}

export default function child(
  fn: (host, el) => boolean = (host, el) => true,
  options = { deep: false, nested: false }
) {
  return {
    get: (host) => walk(host, fn, options),
    connect(host, key, invalidate) {
      const observer = new MutationObserver(invalidate)

      observer.observe(host, {
        childList: true,
        subtree: !!options.deep,
      })

      return () => {
        observer.disconnect()
      }
    },
  }
}
