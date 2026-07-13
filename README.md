# 🔧 dxf-crosshair-remover

Утилита для постобработки DXF из **Tekla / Advance Steel**:

1. **`process`** — убрать перекрестия и преобразовать отверстия в `CIRCLE` (рекомендуется)
2. **`remove-crosses`** — только удалить перекрестия
3. **`to-circles`** — только polyline → `CIRCLE`

Контур (`CUT`), текстовые метки (`SCRIBE`, `TEXT`) и сами отверстия сохраняются.

Репозиторий: [github.com/oooargon/dxf-crosshair-remover](https://github.com/oooargon/dxf-crosshair-remover)

## 📋 Требования

- [Node.js](https://nodejs.org/) **20+** (для разработки и сборки)
- npm
- Windows (exe и контекстное меню)

## 📦 Установка (разработка)

```bash
git clone https://github.com/oooargon/dxf-crosshair-remover.git
cd dxf-crosshair-remover
npm install
```

## 🚀 Использование: npm-скрипты

> После `npm run` обязательно ставьте `--`, затем аргументы:
> `npm run process -- examples -o out`

| Команда | Назначение |
|---------|------------|
| `npm run process` | Кресты + круги за один проход |
| `npm run remove-crosses` | Только удалить перекрестия |
| `npm run to-circles` | Только polyline → `CIRCLE` |
| `npm run analyze` | Анализ структуры DXF |
| `npm run build` | Собрать `bin/dxf-crosshair-remover.exe` |

### Общие аргументы CLI

| Опция | Описание |
|-------|----------|
| `<путь>` | Один `.dxf` или папка с `.dxf` |
| `-o`, `--out <папка>` | Записать результат в папку |
| `-i`, `--inplace` | Перезаписать исходники |
| `-n`, `--dry-run` | Только отчёт, без записи |
| `-s`, `--suffix <текст>` | Суффикс имени (без `-o`/`-i`) |
| `-h`, `--help` | Справка |

### Примеры

```bash
# Всё сразу — рекомендуемый сценарий
npm run process -- examples -o out
npm run process -- examples/Б1-1002.dxf -o out

# Проверка без записи
npm run process -- examples --dry-run

# Анализ
npm run analyze -- examples/Б1-1002.dxf
```

## 💻 Использование: exe (без Node.js на целевой машине)

### Сборка exe локально

```bash
npm run build
```

Результат: `bin/dxf-crosshair-remover.exe` (~38 МБ).

Сборка: **esbuild** (бандл TypeScript) + **caxa** (упаковка Node.js runtime в exe). Это не Electron — только CLI и встроенный Node.

### Запуск exe

```bash
bin\dxf-crosshair-remover.exe process examples -o out
bin\dxf-crosshair-remover.exe remove-crosses examples -o out
bin\dxf-crosshair-remover.exe to-circles out --inplace
bin\dxf-crosshair-remover.exe analyze examples/Б1-1002.dxf
bin\dxf-crosshair-remover.exe --help
bin\dxf-crosshair-remover.exe process --help
```

## 🖱️ Контекстное меню Windows

Файлы в `context/`:

| Файл | Назначение |
|------|------------|
| `ctx-cmd-dxf-process.reg` | Пункт **«Исправить DXF-файлы Tekla/Advance Steel»** |
| `run-dxf-process.cmd` | Запуск обработки выбранной папки |

### Установка

1. Соберите exe: `npm run build`
2. При переносе проекта откройте `ctx-cmd-dxf-process.reg` и поправьте путь в `command`
3. Дважды щёлкните `.reg` → подтвердите импорт
4. ПКМ по папке с DXF → **Исправить DXF-файлы Tekla/Advance Steel**
5. Результат: `<выбранная_папка>\out\`

`run-dxf-process.cmd` сначала ищет `bin\dxf-crosshair-remover.exe`, иначе запускает через npm.

> `.reg`-файлы хранятся в кодировке **UTF-16 LE** (стандарт Windows Registry). Не пересохраняйте их в UTF-8 через обычный блокнот — кириллица станет «кракозябрами».

### Удаление пункта меню

Удалите ключ: `HKEY_CLASSES_ROOT\Directory\shell\DxfCrossRemover`

## ⚙️ Как это работает

Отверстия в DXF Tekla — закрытые `POLYLINE` (2 вершины, `bulge = ±1`). Перекрестия — пары `LINE` на том же слое.

| Что | Тип DXF | Слои |
|-----|---------|------|
| Контур | `POLYLINE` | `CUT` |
| Отверстия | `POLYLINE` (bulge ±1) | `22`, `18`, `27`, `OVERSIZE` |
| Перекрестия | 2× `LINE` | тот же слой |
| Метки | `TEXT` | `SCRIBE`, `TEXT` |

## 📄 Лицензия

Проект распространяется под лицензией [MIT](LICENSE.md).

Copyright (c) 2026 Argon LLC