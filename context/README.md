# Контекстное меню Windows

## Куда положить exe

Скопируйте `dxf-crosshair-remover.exe` в:

```
D:\dxf-crosshair-remover\dxf-crosshair-remover.exe
```

Скачайте exe из [Releases](https://github.com/oooargon/dxf-crosshair-remover/releases) или соберите: `npm run build` → `bin\dxf-crosshair-remover.exe`.

## Установка пункта меню

1. Убедитесь, что exe лежит по пути `D:\dxf-crosshair-remover\dxf-crosshair-remover.exe`
2. Дважды щёлкните `ctx-cmd-dxf-process.reg` → подтвердите импорт
3. ПКМ по папке с DXF → **Исправить DXF-файлы Tekla/Advance Steel**
4. Результат: `<выбранная_папка>\out\`

Если exe на другом диске/пути — откройте `.reg` в блокноте и поправьте строку `command`.

> `.reg` хранится в UTF-16 LE. Не пересохраняйте в UTF-8.

## Удаление

Удалите ключ реестра: `HKEY_CLASSES_ROOT\Directory\shell\DxfCrossRemover`
