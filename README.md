# EasyS

**EasyS** — декларативный язык для сборки небольших сайтов.  
Исходник `.easys` компилируется в статический **HTML + CSS + JavaScript** без React и лишних runtime-зависимостей.

```
.easys
  → Lexer
  → Parser
  → AST
  → Semantic
  → Component Expander
  → Module Loader (imports)
  → HTML / CSS / JS Codegen
  → dist/
```

---

## Что умеет язык сейчас

| Возможность | Пример |
|-------------|--------|
| Страницы и routing (History API) | `page Home "/" { ... }` |
| Компоненты | `component Card(title) { ... }` |
| Multi-file imports | `import "./components/Header.easys"` |
| State + actions | `count += 1`, `sent = true` |
| `if` / `else` | условный UI |
| `for` | циклы по массивам |
| Стили | `style CardStyle { ... }` |
| Ссылки и navigate | `link "About" "/about"`, `navigate "/about"` |
| CLI-проект | `easys init` / `build` / `dev` / `check` |

---

## Структура репозитория

```
EasyS/
├── compiler/                 # компилятор + CLI
│   ├── src/
│   │   ├── lexer/
│   │   ├── parser/
│   │   ├── ast/
│   │   ├── semantic/
│   │   ├── components/
│   │   ├── codegen/          # HTML, CSS, JS
│   │   ├── project/          # findProject, ModuleLoader
│   │   ├── config/
│   │   └── cli/              # easys init|build|dev|check|format
│   ├── examples/
│   │   ├── full.easys        # все фичи в одном файле
│   │   ├── App.easys
│   │   ├── components.easys
│   │   └── easys-demo/       # полноценный multi-page showcase
│   ├── tests/
│   └── package.json
├── vercel.json
└── README.md
```

---

## Установка

Нужны **Node.js 18+** и npm.

```powershell
git clone https://github.com/S0nder9/EasyS.git
cd EasyS/compiler
npm install
npm run build
npm link
```

Проверка CLI:

```powershell
easys
```

Должны появиться команды: `init`, `build`, `dev`, `check`, `format`.

Если `easys` всё ещё показывает старое меню — перелинкуйте:

```powershell
npm unlink -g easys
npm link
```

---

## Быстрый старт

### 1. Новый проект

```powershell
easys init my-site
cd my-site
easys build
easys dev
```

Откроется `http://localhost:3000`.

Структура после `init`:

```
my-site/
├── easys.config
├── src/
│   ├── App.easys
│   ├── pages/
│   └── components/
├── public/
└── dist/
```

### 2. Demo из репозитория

```powershell
cd EasyS/compiler/examples/easys-demo
easys check
easys build
easys dev
```

Или из папки `compiler`:

```powershell
easys build examples/easys-demo/src/App.easys
easys build examples/full.easys
```

### 3. Команды CLI

| Команда | Описание |
|---------|----------|
| `easys init <name>` | создать проект |
| `easys build [file]` | собрать в `dist/` |
| `easys dev` | build + сервер :3000 + watch |
| `easys check [file]` | проверка без emit |
| `easys format [file]` | простой formatter |

Без аргумента `build` / `check` / `dev` ищут `easys.config` **вверх по дереву каталогов** и берут `entry`.

### 4. `easys.config`

```json
{
  "appName": "Hello",
  "entry": "src/App.easys",
  "output": "dist",
  "srcDir": "src",
  "publicDir": "public"
}
```

---

## Синтаксис языка

### Программа

Файл может содержать:

1. `import`
2. `style`
3. `component`
4. один блок `app` (только в entry-файле)

```easys
import "./styles/theme.easys"
import "./components/Header.easys"

style TitleStyle {
  padding: 8
  background: "#0f172a"
  color: "#ffffff"
}

component Header() {
  container class TitleStyle {
    heading "EasyS"
  }
}

app MyApp {
  page Home "/" {
    ui {
      Header()
      heading "Hello"
    }
  }
}
```

### Imports

```easys
import "./components/Header.easys"
import Header from "./components/Header.easys"
```

Импортируются **компоненты и стили** из другого `.easys`.  
Entry-файл обязан содержать `app`. Модули могут быть только из `component` / `style`.

### App и страницы

```easys
app Portfolio {
  page Home "/" { ... }
  page About "/about" { ... }
}
```

У каждой страницы:

- `name` — идентификатор
- `route` — строка пути (`"/"`, `"/about"`)
- опционально `state { ... }`
- `ui { ... }`

Routing в браузере — **History API** (`pushState` / `popstate`), без отдельного backend.

### State

```easys
state {
  count: number = 0
  loggedIn: boolean = true
  title: string = "Hello"
  items: string[] = ["A", "B", "C"]
}
```

Поддерживаемые типы в объявлениях: `number`, `boolean`, `string`, массивы `T[]`.

### UI-элементы

```easys
heading "Title"
text "Plain text"
text count

button "Click" {
  action {
    count += 1
  }
}

link "About" "/about"

container class CardStyle {
  heading "Inside"
  text "box"
}

section {
  heading "Block"
}
```

| Элемент | Описание |
|---------|----------|
| `heading` | заголовок (`<h1>`) |
| `text` | текст или выражение |
| `button` | кнопка + опциональный `action` |
| `link` | SPA-ссылка |
| `container` | `div`, опционально `class StyleName` |
| `section` | `<section>` |
| `if` / `else` | условный рендер |
| `for` | цикл |
| `ComponentName(...)` | вызов компонента |

### Actions

```easys
button "+" {
  action {
    count += 1
  }
}

button "Go" {
  action {
    navigate "/about"
  }
}

button "Send" {
  action {
    sent = true
  }
}
```

Операторы выражений: `+=`, `=`, `+`, `-`, `*`, `/`, сравнения (`==`, `!=`, `<`, `>`, …), доступ к полю (`user.name`).

### Компоненты

Обязательны скобки параметров, даже без аргументов:

```easys
component Header() {
  container class HeaderStyle {
    heading "EasyS"
    link "Home" "/"
  }
}

component FeatureCard(title, description) {
  container class CardStyle {
    heading title
    text description
  }
}

# вызов
Header()
FeatureCard("State", "Reactive variables")
```

### Условия и циклы

```easys
if loggedIn {
  heading "Welcome"
} else {
  heading "Please login"
}

for item in items {
  text item
}
```

### Стили

```easys
style CardStyle {
  padding: 20
  radius: 12
  background: "#ffffff"
  color: "#111111"
  margin: 8
}
```

Применение:

```easys
container class CardStyle {
  text "Styled"
}
```

Числовые значения вроде `padding: 20` компилятор обычно дополняет до `px` в CSS.

---

## Pipeline компилятора

1. **Lexer** — токены  
2. **Parser** — AST (`Program` / `Module`)  
3. **ModuleLoader** — резолв `import`, merge styles + components  
4. **Semantic Analyzer** — переменные, компоненты, стили  
5. **ComponentExpander** — подстановка тел компонентов  
6. **Codegen**
   - `HtmlGenerator` → `index.html`
   - `CssGenerator` → `style.css`
   - `JsGenerator` + runtime → `app.js` (state, if/for, routes, actions)

Результат:

```
dist/
  index.html
  style.css
  app.js
  assets/          # из public/, если есть
```

---

## Примеры

### Минимальный

```easys
app Hello {
  page Home "/" {
    ui {
      heading "Hello EasyS"
      text "Your first app"
    }
  }
}
```

### Счётчик

```easys
app Counter {
  page Home "/" {
    state {
      count: number = 0
    }
    ui {
      text count
      button "+" {
        action {
          count += 1
        }
      }
    }
  }
}
```

### Multi-page + компонент

См. `compiler/examples/easys-demo/`:

- `src/App.easys` — страницы Home / About / Projects / Contact  
- `src/components/*` — Header, Footer, карточки  
- `src/styles/theme.easys` — тема  

Полный one-file пример: `compiler/examples/full.easys`.

---

## Тесты

```powershell
cd EasyS/compiler
npm test
```

Покрывают lexer, parser, semantic, html/css, components, control-flow, router, imports, CLI/project system.

---

## Деплой на Vercel

Для showcase `easys-demo`:

1. Import репозитория в Vercel  
2. **Root Directory:** `compiler/examples/easys-demo`  
3. **Framework:** Other  
4. **Build Command:** `npm run build`  
5. **Output Directory:** `dist`  

Скрипт `compiler/scripts/vercel-build-demo.js` соберёт компилятор и скомпилирует demo.  
`vercel.json` внутри demo делает SPA-fallback для клиентских маршрутов.

---

## Ограничения (текущая версия)

Пока **нет** (или только заготовки в AST):

- `input` / `textarea` / `bind` (формы)
- объекты в state (`{ name, url }`) как полноценный тип
- page-модули как отдельные entry (`import page from ...`)
- hash-routing fallback для GitHub Pages
- package registry / стандартная библиотека

Планируемое развитие: IR-слой, формы, богатые массивы/объекты, официальные docs.

---

## Разработка компилятора

```powershell
cd EasyS/compiler
npm install
npm run build          # tsc → dist/
npm test               # vitest
node dist/cli/easys.js build examples/full.easys
```

Глобальная команда после `npm link` указывает на `dist/cli/easys.js`.

---

## Лицензия и авторы

Репозиторий: [github.com/S0nder9/EasyS](https://github.com/S0nder9/EasyS)

EasyS — учебный / экспериментальный язык: от идеи «простой UI → статический сайт» до рабочего pipeline с компонентами, routing и CLI.
