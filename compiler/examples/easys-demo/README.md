# EasyS Demo Website

Showcase project for the current EasyS language and compiler.

## Run

```powershell
cd examples/easys-demo
easys check
easys build
easys dev
```

Or from the compiler package:

```powershell
cd compiler
node dist/cli/easys.js build examples/easys-demo/src/App.easys
```

## What it demonstrates

- Multi-page routing (`/`, `/about`, `/projects`, `/contact`)
- Components (`Header`, `Footer`, `FeatureCard`, `ProjectCard`)
- Styles (`HeaderStyle`, `HeroStyle`, `CardStyle`, ...)
- State + actions (`count += 1`, `sent = true`)
- `if` / `else`
- `for` loops over string arrays
- Links and `navigate`

## Layout

```
easys-demo/
├── easys.config
├── src/
│   ├── App.easys          ← entry (everything compiles from here)
│   ├── components/        ← reference components (docs / future imports)
│   └── pages/             ← reference pages (future multi-file)
├── public/
└── dist/
```

> Multi-file `import` resolution is not implemented yet.
> Component/page files under `components/` and `pages/` are reference copies;
> the working program is fully inlined in `src/App.easys`.
