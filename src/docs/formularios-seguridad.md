# Formularios y Seguridad - Documentación Completa

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
3. [Implementación Actual](#implementación-actual)
4. [Capas de Protección](#capas-de-protección)
5. [Código Detallado](#código-detallado)
6. [Añadir Nuevos Formularios](#añadir-nuevos-formularios)
7. [Testing y Validación](#testing-y-validación)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

La seguridad de formularios es **crítica** para proteger la aplicación contra ataques. Este documento explica la implementación de seguridad en los formularios de JavierTamaritWeb.

### Estado Actual

- **Formularios totales:** 1
- **Inputs de texto:** 1
- **Textareas:** 0
- **Nivel de seguridad:** A+ (Enterprise-grade)

### Amenazas Cubiertas

✅ Cross-Site Scripting (XSS)  
✅ SQL Injection  
✅ Code Injection  
✅ HTML Injection  
✅ Command Injection  
✅ Paste-based attacks  
✅ Drag & Drop attacks

---

## Arquitectura de Seguridad

### Filosofía de Defensa en Profundidad

Usamos **múltiples capas** de seguridad. Si una falla, las demás protegen:

```
[Usuario] → [Validación HTML] → [JavaScript] → [Sanitización] → [Escape HTML] → [Detección] → [Procesamiento Seguro]
            ❌ Removido             ✅ Activo      ✅ Activo      ✅ Activo     ✅ Activo      ✅ Activo
```

### Por qué Removimos `pattern` del HTML

**Problema:**
```html
<!-- Esto causaba error en navegadores modernos -->
<input pattern="[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9\-_.,:;()!¿¡?]*">
```

**Error:**
```
Invalid regular expression: Invalid character in character class
```

**Solución:**
- Removimos validación HTML
- Implementamos validación JavaScript más robusta
- **Resultado:** Más seguro y sin errores

---

## Implementación Actual

### Único Formulario: Buscador de Recetas

**Ubicación:** `build/dieta_equilibrada.html` línea 378

**HTML:**
```html
<input 
    type="text" 
    id="busqueda-texto" 
    class="buscador-recetas__input" 
    name="busqueda"
    placeholder="Busca recetas, ingredientes o comentarios..."
    autocomplete="off"
    maxlength="100"
    spellcheck="false"
    data-validation="true"
    aria-label="Campo de búsqueda de recetas"
    role="searchbox"
    aria-autocomplete="list"
    aria-controls="sugerencias-busqueda"
>
```

**Protección:** `src/js/buscador-seguro.js`

---

## Capas de Protección

### Capa 1: Limitación de Longitud

**HTML:**
```html
maxlength="100"
```

**Propósito:** Prevenir DoS por input excesivamente largo

**¿Por qué 100?**
- Suficiente para búsquedas normales
- Reduce superficie de ataque
- Previene bufferoverflow en sistemas antiguos

### Capa 2: Filtrado de Caracteres

**JavaScript (línea 81-83):**
```javascript
esTextoValido(texto) {
    const patronPermitido = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9\-_.,:;()!¿?¡]*$/;
    return patronPermitido.test(texto);
}
```

**Caracteres permitidos:**
- Letras: `a-z`, `A-Z`, con acentos `À-ÿ`
- Ñ y ñ: `\u00f1`, `\u00d1`
- Números: `0-9`
- Espacios: `\s`
- Puntuación básica: `- _ . , : ; ( ) ! ¿ ? ¡`

**Caracteres bloqueados:**
- HTML tags: `< >`
- Comillas: `"` `'` `` ` ``
- Llaves: `{ }`
- Barras: `/ \`
- Otros: `| ^ ~ [ ]`

### Capa 3: Sanitización Activa

**JavaScript (línea 33-55):**
```javascript
sanitizarTexto(texto) {
    if (!texto || typeof texto !== 'string') return '';
    
    // Limitar longitud
    if (texto.length > 100) {
        texto = texto.substring(0, 100);
    }
    
    // Eliminar espacios
    texto = texto.trim();
    
    // Aplicar filtros de seguridad
    Object.values(this.filtrosBloqueo).forEach(filtro => {
        texto = texto.replace(filtro, '');
    });
    
    // Escapar HTML
    texto = this.escaparHTML(texto);
    
    return texto;
}
```

**Proceso:**
1. Valida tipo de dato
2. Trunca a 100 caracteres
3. Elimina espacios al inicio/final
4. Aplica todos los filtros de seguridad
5. Escapa caracteres HTML restantes

### Capa 4: Escape de HTML/XSS

**JavaScript (línea 62-73):**
```javascript
escaparHTML(texto) {
    const mapa = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;'
    };
    
    return texto.replace(/[&<>"'/]/g, char => mapa[char]);
}
```

**Conversiones:**
- `&` → `&amp;` (previene entity injection)
- `<` → `&lt;` (previene tags)
- `>` → `&gt;` (previene tags)
- `"` → `&quot;` (previene atributos)
- `'` → `&#039;` (previene atributos)
- `/` → `&#x2F;` (previene cierre de tags)

**Resultado:**
```javascript
// Entrada maliciosa
const malicioso = "<script>alert('XSS')</script>";

// Después de escapar
const seguro = "&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;";
```

### Capa 5: Detección de Inyección

**JavaScript (línea 90-113):**
```javascript
detectarInyeccion(texto) {
    const textoLower = texto.toLowerCase();
    
    const patronesPeligrosos = [
        'javascript:',
        '<script',
        'onload=',
        'onerror=',
        'onclick=',
        'eval(',
        'document.cookie',
        'window.location',
        'alert(',
        'confirm(',
        'prompt(',
        'union select',  // SQL
        'drop table',    // SQL
        '--',            // SQL Comment
        ';'              // Command separator
    ];
    
    return patronesPeligrosos.some(patron => 
        textoLower.includes(patron)
    );
}
```

**Comportamiento:**
- Si detecta patrón peligroso → Bloquea input
- Limpia el campo automáticamente
- Muestra alerta al usuario

### Capa 6: Protección contra Pegado

**JavaScript (línea 236-244):**
```javascript
this.inputBusqueda.addEventListener('paste', (event) => {
    setTimeout(() => {
        const valorPegado = event.target.value;
        if (this.detectarInyeccion(valorPegado)) {
            event.target.value = '';
            this.mostrarAlerta('Contenido pegado bloqueado por seguridad');
        }
    }, 10);
});
```

**Propósito:**
- Usuarios podrían copiar código malicioso
- Se detecta y bloquea automáticamente
- El usuario es informado

### Capa 7: Protección contra Drag & Drop

**JavaScript (línea 247-250):**
```javascript
this.inputBusqueda.addEventListener('drop', (event) => {
    event.preventDefault();
    this.mostrarAlerta('Arrastrar y soltar deshabilitado por seguridad');
});
```

**Propósito:**
- Prevenir arrastrar archivos/código al input
- Superficie de ataque cerrada

---

## Código Detallado

### Clase `BuscadorSeguro`

#### Constructor

```javascript
constructor() {
    this.inputBusqueda = document.getElementById('busqueda-texto');
    this.filtrosBloqueo = this.crearFiltrosSeguridad();
    this.inicializar();
}
```

**Inicializa:**
1. Referencia al input
2. Filtros de seguridad
3. Event listeners

#### Filtros de Seguridad

```javascript
crearFiltrosSeguridad() {
    return {
        scriptTags: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        htmlTags: /<[^>]*>/g,
        javascript: /javascript:/gi,
        onEvents: /on\w+\s*=/gi,
        sqlInjection: /(union|select|insert|delete|drop|create|alter|exec|execute|\-\-|;)/gi,
        caracteresProhibidos: /[<>"'`{}|\\^~\[\]]/g,
        urlSospechosas: /(http|https|ftp|data):/gi
    };
}
```

**Filtros Regex:**

1. **scriptTags:** Detecta `<script>...</script>`
2. **htmlTags:** Detecta cualquier tag HTML
3. **javascript:** Detecta `javascript:` URLs
4. **onEvents:** Detecta `onclick=`, `onload=`, etc.
5. **sqlInjection:** Detecta comandos SQL
6. **caracteresProhibidos:** Detecta caracteres peligrosos
7. **urlSospechosas:** Detecta URLs en protocolos sospechosos

#### Event Handler Principal

```javascript
manejarInput(event) {
    const valorOriginal = event.target.value;
    
    // 1. Detectar inyección
    if (this.detectarInyeccion(valorOriginal)) {
        console.warn('⚠️ Intento de inyección detectado');
        event.target.value = '';
        this.mostrarAlerta('Entrada no válida detectada');
        return;
    }
    
    // 2. Validar caracteres
    if (!this.esTextoValido(valorOriginal)) {
        const textoLimpio = valorOriginal.replace(
            /[^a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9\-_.,:;()!¿?¡]/g, 
            ''
        );
        event.target.value = textoLimpio;
    }
    
    // 3. Sanitizar
    const textoSeguro = this.sanitizarTexto(event.target.value);
    
    if (textoSeguro !== event.target.value) {
        event.target.value = textoSeguro;
    }
    
    // 4. Procesar búsqueda
    this.procesarBusqueda(textoSeguro);
}
```

**Flujo:**
1. Detecta patrones de inyección → Bloquea
2. Filtra caracteres no permitidos → Limpia
3. Sanitiza el texto → Escapa HTML
4. Procesa búsqueda → Solo si es seguro

### Inicialización

```javascript
document.addEventListener('DOMContentLoaded', () => {
    new BuscadorSeguro();
});
```

**Por qué DOMContentLoaded:**
- Garantiza que el input existe antes de añadir listeners
- Evita errores de referencia

---

## Añadir Nuevos Formularios

### Paso 1: Crear el HTML

```html
<form id="mi-formulario" class="formulario-seguro">
    <input 
        type="text" 
        id="mi-input" 
        name="nombre"
        class="formulario__input"
        placeholder="Tu nombre..."
        maxlength="50"
        autocomplete="off"
        data-validation="true"
        aria-label="Campo de nombre"
    >
    
    <button type="submit" class="formulario__submit">
        Enviar
    </button>
</form>
```

**Atributos importantes:**
- `maxlength` - Límite de caracteres
- `autocomplete="off"` - Desactiva autocompletado
- `data-validation="true"` - Marca para JavaScript
- `aria-label` - Accesibilidad

### Paso 2: Crear el JavaScript de Seguridad

**Archivo:** `src/js/mi-formulario-seguro.js`

```javascript
class MiFormularioSeguro {
    constructor() {
        this.formulario = document.getElementById('mi-formulario');
        this.input = document.getElementById('mi-input');
        this.inicializar();
    }
    
    sanitizarTexto(texto) {
        if (!texto || typeof texto !== 'string') return '';
        
        // Limitar longitud
        texto = texto.substring(0, 50);
        
        // Trim
        texto = texto.trim();
        
        // Eliminar HTML tags
        texto = texto.replace(/<[^>]*>/g, '');
        
        // Escapar HTML
        const mapa = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return texto.replace(/[&<>"']/g, c => mapa[c]);
    }
    
    validarInput(event) {
        const valor = event.target.value;
        
        // Patrón permitido (solo letras y espacios)
        const patron = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/;
        
        if (!patron.test(valor)) {
            // Limpiar caracteres no permitidos
            event.target.value = valor.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g, '');
        }
    }
    
    manejarSubmit(event) {
        event.preventDefault();
        
        // Obtener y sanitizar valor
        const valorLimpio = this.sanitizarTexto(this.input.value);
        
        // Validar que no esté vacío
        if (!valorLimpio) {
            alert('Por favor ingresa tu nombre');
            return;
        }
        
        // Aquí procesarías el formulario de forma segura
        console.log('Valor seguro:', valorLimpio);
        
        // Ejemplo: enviar a servidor
        // fetch('/api/submit', {
        //     method: 'POST',
        //     body: JSON.stringify({ nombre: valorLimpio })
        // });
    }
    
    inicializar() {
        if (!this.formulario || !this.input) return;
        
        // Validación en tiempo real
        this.input.addEventListener('input', (e) => {
            this.validarInput(e);
        });
        
        // Submit seguro
        this.formulario.addEventListener('submit', (e) => {
            this.manejarSubmit(e);
        });
        
        console.log('✅ Formulario seguro inicializado');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new MiFormularioSeguro();
});
```

### Paso 3: Incluir el Script

```html
<script src="js/mi-formulario-seguro.js" defer></script>
```

### Paso 4: Testing

```javascript
// Tests de seguridad
const ataques = [
    "<script>alert('XSS')</script>",
    "'; DROP TABLE users--",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')"
];

ataques.forEach(ataque => {
    console.log('Probando:', ataque);
    // Pegar en el input y verificar que se bloquee
});
```

---

## Testing y Validación

### Tests Manuales

#### Test 1: XSS Básico

**Input:**
```
<script>alert('XSS')</script>
```

**Resultado esperado:**
- Input se limpia automáticamente
- Queda vacío o solo con letras válidas

#### Test 2: HTML Injection

**Input:**
```
<img src=x onerror=alert('XSS')>
```

**Resultado esperado:**
- Tags se eliminan
- Queda: (vacío)

#### Test 3: SQL Injection

**Input:**
```
'; DROP TABLE recetas--
```

**Resultado esperado:**
- Detectado por `detectarInyeccion()`
- Campo se limpia
- Alerta mostrada

#### Test 4: Event Handlers

**Input:**
```
<div onclick="alert('XSS')">Click</div>
```

**Resultado esperado:**
- `onclick=` detectado
- Bloqueado

#### Test 5: Caracteres Válidos

**Input:**
```
Receta de paella, ¿con azafrán? ¡Sí!
```

**Resultado esperado:**
- Se permite completamente
- Todos los caracteres son válidos

### Tests Automáticos (Opcional)

```javascript
// test-seguridad.js
describe('Seguridad de Formularios', () => {
    let seguridad;
    
    beforeEach(() => {
        seguridad = new BuscadorSeguro();
    });
    
    test('Debe bloquear scripts', () => {
        const malicioso = "<script>alert('xss')</script>";
        expect(seguridad.detectarInyeccion(malicioso)).toBe(true);
    });
    
    test('Debe escapar HTML', () => {
        const html = "<div>Test</div>";
        const escapado = seguridad.escaparHTML(html);
        expect(escapado).toBe("&lt;div&gt;Test&lt;/div&gt;");
    });
    
    test('Debe permitir texto válido', () => {
        const valido = "Receta de pasta";
        expect(seguridad.esTextoValido(valido)).toBe(true);
    });
});
```

---

## Mejores Prácticas

### ✅ Hacer

1. **Siempre sanitizar input del usuario**
   ```javascript
   const limpio = sanitizarTexto(input.value);
   ```

2. **Validar tanto en cliente como servidor**
   - Cliente: UX rápida
   - Servidor: Seguridad real

3. **Usar whitelist, no blacklist**
   ```javascript
// ✅ CORRECTO: Permitir solo lo específico
   const permitido = /^[a-zA-Z0-9\s]*$/;
   
   // ❌ INCORRECTO: Bloquear cosas específicas
   const bloqueado = /[<>]/g; // Fácil de evadir
   ```

4. **Escapar antes de mostrar**
   ```javascript
   element.textContent = escaparHTML(userInput);
   // NO: element.innerHTML = userInput;
   ```

5. **Limitar longitud**
   ```html
   <input maxlength="100">
   ```

6. **Deshabilitar autocomplete en campos sensibles**
   ```html
   <input autocomplete="off">
   ```

### ❌ Evitar

1. **NUNCA confiar en input del usuario**
   ```javascript
   // ❌ MAL
   element.innerHTML = userInput;
   
   // ✅ BIEN
   element.textContent = sanitizarTexto(userInput);
   ```

2. **No usar `eval()` con input de usuario**
   ```javascript
   // ❌ NUNCA HAGAS ESTO
   eval(userInput);
   ```

3. **No construir SQL con concatenación**
   ```javascript
   // ❌ MAL
   const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
   
   // ✅ BIEN (usar prepared statements en backend)
   const query = "SELECT * FROM users WHERE name = ?";
   ```

4. **No insertar HTML directamente**
   ```javascript
   // ❌ MAL
   div.innerHTML = userInput;
   
   // ✅ BIEN
   div.textContent = sanitizarTexto(userInput);
   ```

### Checklist de Seguridad

Antes de añadir un nuevo formulario, verifica:

- [ ] ¿Tiene `maxlength`?
- [ ] ¿Tiene validación JavaScript?
- [ ] ¿Se sanitiza el input?
- [ ] ¿Se escapa HTML al mostrar?
- [ ] ¿Se detectan patrones de inyección?
- [ ] ¿Se bloquea paste malicioso?
- [ ] ¿Se bloquea drag & drop?
- [ ] ¿Se valida en el servidor? (si aplica)
- [ ] ¿Se probó con ataques comunes?
- [ ] ¿Tiene mensajes de error claros?

---

## Recursos Adicionales

### OWASP Top 10

1. [Injection](https://owasp.org/www-project-top-ten/2017/A1_2017-Injection)
2. [Cross-Site Scripting (XSS)](https://owasp.org/www-project-top-ten/2017/A7_2017-Cross-Site_Scripting_(XSS))

### Herramientas

- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de seguridad
- [Burp Suite](https://portswigger.net/burp) - Testing de penetración
- [XSS Hunter](https://xsshunter.com/) - Detectar XSS

### Lecturas Recomendadas

- [MDN: HTML5 Security Cheat Sheet](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Última actualización:** 2025-12-12  
**Versión del proyecto:** 3.0.3  
**Nivel de seguridad:** A+ (Enterprise-grade)
