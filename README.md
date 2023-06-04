# Jiggy

> A featherweight jig library developing and testing web components.

## Getting Started

```bash
npm i -D jiggy
pnpm add -D jiggy
```

```html
<!-- jiggy uses Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

<!-- Import your component -->
<script type="module" src="./path/to/your-component"></script>

<!-- Gettin' jiggy wit it -->
<script type="module" src="/node_modules/jiggy/dist/jiggy.js"></script>

<!-- na-na, na, na-na-na -->
<jig-block>
  <your-component></your-component>
</jig-block>
```

## API
Jiggy is purposefully small and simple.

### &lt;jig-block&gt;

Jig Block wraps your component in a jig.

```html
<jig-block>
  <your-component></your-component>
</jig-block>
```

It creates a form for your props.

```html
<jig-block props="foo, bar">
  <your-component
    foo="initial foo"
    bar="initial bar"
  ></your-component>
</jig-block>
```

It can also listen for component events.

```html
<jig-block events="load, change">
  <your-component></your-component>
  <jig-log slot="log"></jig-log>
</jig-block>
```

It can also document CSS Custom Properties

```html
<jig-block vars="background, color">
  <your-component></your-component>
  <jig-var slot="var"></jig-var>
</jig-block>
```

### &lt;jig-log&gt;
Prints out the jig event log.

```html
<jig-block events="load, change">
  <your-component></your-component>
  <jig-log slot="log"></jig-log>
</jig-block>
```

### &lt;jig-var&gt;
Edit CSS Custom Properties

```html
<jig-block vars="background, color">
  <your-component></your-component>
  <jig-var slot="var"></jig-var>
</jig-block>
```

## Contributing
Contributions are welcome. Let's make web components better together 🤝
