# Plataforma de Investigación de Operaciones II

Proyecto sin dependencias: HTML, CSS y JavaScript puros.

## Estructura
- `index.html`: páginas (inicio, simplex, programación no lineal, inventarios, líneas de espera)
- `styles.css`: estilos y tema claro/oscuro
- `app.js`: los cuatro solucionadores
  - `solveSimplex()`: simplex con gran M
  - `solvePNL()`: Nelder-Mead con penalización
  - `solveInv()`: EOQ, EOQ con faltantes, EPQ
  - `solveQ()`: M/M/1, M/M/s, M/M/1/K, M/G/1

## Cómo abrirlo en Visual Studio Code
1. Descomprime la carpeta y ábrela con File > Open Folder.
2. Instala la extensión Live Server y da clic en Go Live (o abre `index.html` en el navegador).
