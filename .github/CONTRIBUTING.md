# Contributing

## Setup

The following steps will get you setup to contribute changes to this repo:

1. Fork the repo (click the <kbd>Fork</kbd> button at the top right of [this page](https://github.com/zubhav/covid-19-vs-markets))
2. Clone your fork locally

```bash
git clone https://github.com/zubhav/covid-19-vs-markets.git
cd covid-19-vs-markets
```

3. Install dependencies and build. COVID-19 vs. Markets uses `npm`.

```bash
npm install
```

## Development

The project uses Svelte with Sapper as its web framework. It uses Tailwind.css as its CSS framework.

To run the development server:

```bash
npm run dev
```

Tailwind.css is used with PostCSS. A command is used to watch for changes and compile the CSS classes into a file which is production-ready.

In a seperate terminal, you will need to run the following command.

```bash
npm run watch:tailwind
```
