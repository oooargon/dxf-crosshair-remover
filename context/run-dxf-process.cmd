@echo off
chcp 65001 >nul
setlocal

set "INPUT_DIR=%~1"
set "EXE=%~dp0..\bin\dxf-crosshair-remover.exe"
set "PROJECT_DIR=%~dp0.."

if "%INPUT_DIR%"=="" (
  echo Укажите папку с DXF-файлами.
  pause
  exit /b 1
)

set "OUT_DIR=%INPUT_DIR%\out"
echo Обработка: %INPUT_DIR%
echo Результат:  %OUT_DIR%
echo.

if exist "%EXE%" (
  "%EXE%" process "%INPUT_DIR%" -o "%OUT_DIR%"
  set "ERR=%ERRORLEVEL%"
  goto :finish
)

cd /d "%PROJECT_DIR%" || (
  echo Не удалось открыть каталог проекта: %PROJECT_DIR%
  pause
  exit /b 1
)

if not exist node_modules (
  echo Установка зависимостей...
  call npm install || (
    echo npm install завершился с ошибкой.
    pause
    exit /b 1
  )
)

call npm run process -- "%INPUT_DIR%" -o "%OUT_DIR%"
set "ERR=%ERRORLEVEL%"

:finish
echo.
if %ERR% neq 0 (
  echo Ошибка обработки, код %ERR%.
) else (
  echo Готово.
)
pause
exit /b %ERR%
