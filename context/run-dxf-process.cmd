@echo off
chcp 65001 >nul
setlocal

set "INPUT_DIR=%~1"
set "SCRIPT_DIR=%~dp0"
set "EXE_LOCAL=%SCRIPT_DIR%dxf-crosshair-remover.exe"
set "EXE_BIN=%SCRIPT_DIR%..\bin\dxf-crosshair-remover.exe"
set "PROJECT_DIR=%SCRIPT_DIR%.."

if "%INPUT_DIR%"=="" (
  echo Укажите папку с DXF-файлами.
  pause
  exit /b 1
)

set "OUT_DIR=%INPUT_DIR%\out"
echo Обработка: %INPUT_DIR%
echo Результат:  %OUT_DIR%
echo.

if exist "%EXE_LOCAL%" (
  "%EXE_LOCAL%" process "%INPUT_DIR%" -o "%OUT_DIR%"
  set "ERR=%ERRORLEVEL%"
  goto :finish
)

if exist "%EXE_BIN%" (
  "%EXE_BIN%" process "%INPUT_DIR%" -o "%OUT_DIR%"
  set "ERR=%ERRORLEVEL%"
  goto :finish
)

echo Не найден dxf-crosshair-remover.exe
echo.
echo Положите exe в одну из папок:
echo   %EXE_LOCAL%
echo   %EXE_BIN%
echo.
echo Скачайте из Releases или соберите: npm run build
echo.
pause
exit /b 1

:finish
echo.
if %ERR% neq 0 (
  echo Ошибка обработки, код %ERR%.
) else (
  echo Готово.
)
pause
exit /b %ERR%