import { define, html, parent } from 'hybrids'
import styles from './jig-log.css?inline'

export const JigLog = define<any>({
  tag: 'jig-log',
  ctx: parent((el) => el.tag === 'jig-block'),
  log: ({ ctx }) => ctx?.log,
  filter: '',
  filtered: ({ log, filter }) =>
    log.filter(({ type, detail }) => {
      const matchType = type.indexOf(filter) > -1
      const matchDetail = JSON.stringify(detail).indexOf(filter) > -1
      return matchType || matchDetail
    }),
  render: ({ filtered }) =>
    html` <input type="search" placeholder="search events" oninput="${html.set('filter')}" />
      <ol class="log">
        ${filtered.map(
          ({ type, timeStamp, detail }) => html` <li class="event" title="${timeStamp}">
            <pre><b>${type}</b> ${JSON.stringify(detail)}</pre>
          </li>`
        )}
      </ol>`.style(styles),
})
