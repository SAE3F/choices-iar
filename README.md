# Choices IAR • Plataforma de Estudio para el Internado Anual Rotatorio (Medicina)

Plataforma web interactiva desarrollada a partir de la digitalización y extracción OCR completa del **Apunte de Paz - IAR (157 páginas)**.

---

## 🚀 Características Principales

1. **📝 Simulador Interactivo de Choices (26 Exámenes • 465 Preguntas)**:
   - Exámenes reales desde **Septiembre 2020 hasta Diciembre 2023**.
   - Soporte para **selección simple y múltiple** ("Seleccione una o más", "Seleccione dos").
   - **Corrección inmediata**: opción correcta en verde, opción errónea en rojo.
   - **Explicación clínica detallada** de cada pregunta.
   - **Diferenciación de origen de respuesta**:
     - `✓ Clave de Examen / Apunte`: Respuestas verificadas de las claves oficiales o reconstrucciones del apunte.
     - `⚠️ Respuesta sugerida (No oficial)`: Cuando el apunte no especificaba la letra, se proporciona la opción más avalada por el criterio médico y la bibliografía, aclarando explícitamente que no es oficial.
   - Filtro por Especialidad (**Clínica Médica**, **Cirugía**, **Tocoginecología**, **Pediatría**).
   - Filtro por **Preguntas Falladas** y sistema de **Guardadas / Favoritas**.

2. **📚 Biblioteca de Teoría Médica Completa (73 Temas)**:
   - Extraída y estructurada de las páginas 92 a 157 del apunte.
   - Buscador instantáneo por patología, síntoma o tratamiento (ej. *CURB-65*, *Duke*, *PBE*, *Tanner*, *Celiaquía*, *Meningitis*).
   - Enlace directo desde cada tema teórico a la práctica de choices de esa especialidad.

3. **👶 Guía de Hitos del Neurodesarrollo Infantil**:
   - Módulo interactivo indispensable para responder las preguntas 1 y 2 de cada examen (casos como *Ileana*, *Juan Cruz*, *Alexia*).
   - Clasificación por edades (1 mes a 5 años) en **Motor Grueso**, **Motor Fino**, **Lenguaje** y **Social**, con criterio de Normal, Tardío y Banderas Rojas.

4. **🧪 Tabla de Valores Normales y Constantes Biológicas**:
   - Serie roja, serie blanca, electrolitos, función renal, hepatograma, y líquidos de punción (criterios de Light para líquido pleural, GASA para ascitis, LCR).

---

## 🌐 Cómo desplegar en Vercel (En 2 minutos)

La aplicación ya está configurada con `vercel.json` para despliegue sin configuración:

### Opción A: Despliegue con GitHub (Recomendado)
1. Crea un repositorio en tu cuenta de GitHub (ej. `iar-medhub`).
2. Sube los archivos de la carpeta `iar-study-app/` a tu repositorio:
   ```bash
   cd iar-study-app
   git init
   git add .
   git commit -m "Initial commit Choices IAR"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/iar-medhub.git
   git push -u origin main
   ```
3. Entra en [vercel.com](https://vercel.com) e inicia sesión.
4. Haz clic en **"Add New... -> Project"** e importa tu repositorio.
5. Vercel detectará automáticamente que es un proyecto **Vite**.
6. Haz clic en **Deploy**. ¡En 30 segundos tendrás tu enlace público HTTPS funcionando!

### Opción B: Despliegue directo por terminal con Vercel CLI
Si tienes la CLI de Vercel instalada:
```bash
cd iar-study-app
npx vercel
```
Sigue los pasos en pantalla (presiona Enter para los valores por defecto) y luego:
```bash
npx vercel --prod
```

---

## 💻 Ejecución en Local

Para probar o estudiar en tu propia máquina:
```bash
cd iar-study-app
npm install
npm run dev
```
Abre en tu navegador `http://localhost:5173`.

---

## 📁 Estructura del Proyecto

```
iar-study-app/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Barra superior con navegación y estadísticas
│   │   ├── QuizView.jsx        # Simulador de choices con corrección y feedback
│   │   ├── TheoryView.jsx      # Visor y buscador de teoría médica
│   │   ├── MilestonesView.jsx  # Guía interactiva de neurodesarrollo
│   │   └── LabValuesView.jsx   # Tabla de valores normales de laboratorio
│   ├── data/
│   │   ├── exams.json          # 26 exámenes y 465 preguntas
│   │   ├── theory.json         # 73 temas médicos curados
│   │   ├── milestones.json     # Pautas de neurodesarrollo
│   │   └── lab_values.json     # Valores de laboratorio
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── vercel.json                 # Configuración de rutas SPA para Vercel
└── package.json
```
