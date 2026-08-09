# EasyS Demo Website

Official showcase: multi-page site with **multi-file imports**.

## Structure

```
easys-demo/
├── easys.config
├── src/
│   ├── App.easys
│   ├── styles/theme.easys
│   ├── components/
│   │   ├── Header.easys
│   │   ├── Footer.easys
│   │   ├── FeatureCard.easys
│   │   └── ProjectCard.easys
│   └── pages/
└── dist/
```

## Imports

```easys
import "./styles/theme.easys"
import Header from "./components/Header.easys"
```

Both forms work:

- `import "./path.easys"`
- `import Name from "./path.easys"`

## Run

```powershell
cd examples/easys-demo
easys check
easys build
easys dev
```
