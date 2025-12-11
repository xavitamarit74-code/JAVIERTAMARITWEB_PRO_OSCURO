/**
 * CustomSelect - Componente de selector personalizado accesible
 * Reemplaza <select> nativos con funcionalidad completa y accesibilidad WAI-ARIA
 */
class CustomSelect {
    constructor() {
        this.instances = new Map();
        this.activeInstanceId = null;
        this.bindedHandleClickOutside = this.handleClickOutside.bind(this);
        this.bindedHandleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Inicializa un selector personalizado
     * @param {HTMLElement} container - Contenedor del selector
     * @param {Object} options - Configuración
     * @param {string} options.name - Nombre del input hidden/select
     * @param {Array} options.options - [{value, label, icon?}]
     * @param {string} options.placeholder - Texto por defecto
     * @param {Function} options.onChange - Callback al cambiar valor
     * @param {string} options.ariaLabel - Label para accesibilidad
     */
    init(container, options = {}) {
        const instanceId = this.generateId();
        const config = {
            name: options.name || 'select',
            options: options.options || [],
            placeholder: options.placeholder || 'Selecciona una opción',
            onChange: options.onChange || (() => {}),
            ariaLabel: options.ariaLabel || 'Selector personalizado',
            ...options
        };

        // Crear estructura HTML
        this.createHTML(container, instanceId, config);
        
        // Configurar eventos y estado
        const instance = this.setupInstance(container, instanceId, config);
        this.instances.set(instanceId, instance);

        return instanceId;
    }

    /**
     * Genera ID único para la instancia
     */
    generateId() {
        return `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Crea la estructura HTML del selector
     */
    createHTML(container, instanceId, config) {
        const listId = `${instanceId}-list`;
        const triggerId = `${instanceId}-trigger`;
        
        container.innerHTML = `
            <div class="custom-select" 
                 id="${instanceId}" 
                 data-name="${config.name}"
                 data-value=""
                 role="combobox"
                 aria-haspopup="listbox"
                 aria-expanded="false"
                 aria-controls="${listId}"
                 aria-label="${config.ariaLabel}"
                 tabindex="0">
                
                <div class="custom-select__trigger" id="${triggerId}">
                    <span class="custom-select__selected" aria-live="polite">
                        ${config.placeholder}
                    </span>
                    <span class="custom-select__arrow" aria-hidden="true">▼</span>
                </div>
                
                <ul class="custom-select__list" 
                    id="${listId}"
                    role="listbox"
                    aria-labelledby="${triggerId}"
                    hidden>
                    ${config.options.map((option, index) => `
                        <li class="custom-select__option"
                            id="${instanceId}-option-${index}"
                            role="option"
                            data-value="${option.value}"
                            aria-selected="false"
                            tabindex="-1">
                            ${option.icon ? `<span class="custom-select__icon">${option.icon}</span>` : ''}
                            <span class="custom-select__label">${option.label}</span>
                        </li>
                    `).join('')}
                </ul>
                
                <!-- Control oculto para degradación progresiva -->
                <select class="custom-select__hidden" name="${config.name}" hidden>
                    <option value="">${config.placeholder}</option>
                    ${config.options.map(option => `
                        <option value="${option.value}">${option.label}</option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    /**
     * Configura la instancia con eventos y estado inicial
     */
    setupInstance(container, instanceId, config) {
        const element = container.querySelector(`#${instanceId}`);
        const trigger = element.querySelector('.custom-select__trigger');
        const list = element.querySelector('.custom-select__list');
        const selectedElement = element.querySelector('.custom-select__selected');
        const hiddenSelect = element.querySelector('.custom-select__hidden');
        const options = element.querySelectorAll('.custom-select__option');

        const instance = {
            id: instanceId,
            element,
            trigger,
            list,
            selectedElement,
            hiddenSelect,
            options: Array.from(options),
            config,
            isOpen: false,
            focusedIndex: -1,
            selectedIndex: -1,
            typeaheadString: '',
            typeaheadTimeout: null
        };

        // Eventos de interacción
        this.setupEvents(instance);

        return instance;
    }

    /**
     * Configura todos los eventos para una instancia
     */
    setupEvents(instance) {
        const { element, trigger, options } = instance;

        // Abrir/cerrar con clic en trigger
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle(instance.id);
        });

        // Selección por clic en opción
        options.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectOption(instance.id, index);
            });

            option.addEventListener('mouseenter', () => {
                this.setFocusedOption(instance.id, index);
            });
        });

        // Navegación por teclado
        element.addEventListener('keydown', (e) => {
            this.handleInstanceKeyDown(instance, e);
        });

        // Prevenir que el foco salga del componente cuando está abierto
        element.addEventListener('focusout', (e) => {
            if (instance.isOpen && !element.contains(e.relatedTarget)) {
                this.close(instance.id);
            }
        });
    }

    /**
     * Maneja eventos de teclado específicos de una instancia
     */
    handleInstanceKeyDown(instance, e) {
        if (!instance.isOpen) {
            // Selector cerrado
            switch (e.key) {
                case 'Enter':
                case ' ':
                case 'ArrowDown':
                case 'ArrowUp':
                    e.preventDefault();
                    this.open(instance.id);
                    break;
            }
        } else {
            // Selector abierto
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close(instance.id);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (instance.focusedIndex >= 0) {
                        this.selectOption(instance.id, instance.focusedIndex);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNext(instance.id);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPrevious(instance.id);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.focusFirst(instance.id);
                    break;
                case 'End':
                    e.preventDefault();
                    this.focusLast(instance.id);
                    break;
                default:
                    // Typeahead
                    if (e.key.length === 1) {
                        this.handleTypeahead(instance.id, e.key);
                    }
                    break;
            }
        }
    }

    /**
     * Abre el selector
     */
    open(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance || instance.isOpen) return;

        // Cerrar otros selectores abiertos
        this.closeAll();

        instance.isOpen = true;
        instance.element.setAttribute('aria-expanded', 'true');
        instance.list.hidden = false;
        instance.element.classList.add('custom-select--open');

        // Configurar foco en la opción seleccionada o primera
        const initialFocus = instance.selectedIndex >= 0 ? instance.selectedIndex : 0;
        this.setFocusedOption(instanceId, initialFocus);

        // Scroll para mostrar la opción focused
        this.scrollToFocusedOption(instanceId);

        // Activar manejo global de eventos
        this.activeInstanceId = instanceId;
        document.addEventListener('click', this.bindedHandleClickOutside, true);
        document.addEventListener('keydown', this.bindedHandleKeyDown, true);

        // Emitir evento personalizado
        this.emit(instance.element, 'custom-select:open', { instanceId });
    }

    /**
     * Cierra el selector
     */
    close(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance || !instance.isOpen) return;

        instance.isOpen = false;
        instance.element.setAttribute('aria-expanded', 'false');
        instance.list.hidden = true;
        instance.element.classList.remove('custom-select--open');
        
        // Limpiar foco de opciones
        this.clearFocusedOption(instanceId);

        // Desactivar manejo global si era la instancia activa
        if (this.activeInstanceId === instanceId) {
            this.activeInstanceId = null;
            document.removeEventListener('click', this.bindedHandleClickOutside, true);
            document.removeEventListener('keydown', this.bindedHandleKeyDown, true);
        }

        // Retornar foco al trigger
        instance.element.focus();

        // Emitir evento personalizado
        this.emit(instance.element, 'custom-select:close', { instanceId });
    }

    /**
     * Alterna entre abrir y cerrar
     */
    toggle(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        if (instance.isOpen) {
            this.close(instanceId);
        } else {
            this.open(instanceId);
        }
    }

    /**
     * Cierra todos los selectores abiertos
     */
    closeAll() {
        this.instances.forEach((instance, id) => {
            if (instance.isOpen) {
                this.close(id);
            }
        });
    }

    /**
     * Selecciona una opción por índice
     */
    selectOption(instanceId, index) {
        const instance = this.instances.get(instanceId);
        if (!instance || index < 0 || index >= instance.options.length) return;

        const option = instance.options[index];
        const value = option.dataset.value;
        const label = option.querySelector('.custom-select__label').textContent;

        // Actualizar estado visual
        instance.selectedIndex = index;
        instance.selectedElement.textContent = label;
        instance.element.dataset.value = value;

        // Actualizar clases de selección
        instance.options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
        option.setAttribute('aria-selected', 'true');

        // Sincronizar con select oculto
        instance.hiddenSelect.value = value;

        // Emitir evento de cambio nativo en el select oculto
        const changeEvent = new Event('change', { bubbles: true });
        instance.hiddenSelect.dispatchEvent(changeEvent);

        // Emitir evento personalizado
        this.emit(instance.element, 'custom-select:change', {
            instanceId,
            name: instance.config.name,
            value,
            label,
            index
        });

        // Ejecutar callback
        if (typeof instance.config.onChange === 'function') {
            instance.config.onChange({ value, label, index });
        }

        // Cerrar selector
        this.close(instanceId);
    }

    /**
     * Establece el foco en una opción
     */
    setFocusedOption(instanceId, index) {
        const instance = this.instances.get(instanceId);
        if (!instance || index < 0 || index >= instance.options.length) return;

        // Limpiar foco anterior
        this.clearFocusedOption(instanceId);

        // Establecer nuevo foco
        instance.focusedIndex = index;
        const option = instance.options[index];
        option.classList.add('custom-select__option--focused');
        
        // Actualizar aria-activedescendant
        instance.element.setAttribute('aria-activedescendant', option.id);
    }

    /**
     * Limpia el foco de todas las opciones
     */
    clearFocusedOption(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        instance.focusedIndex = -1;
        instance.options.forEach(option => {
            option.classList.remove('custom-select__option--focused');
        });
        instance.element.removeAttribute('aria-activedescendant');
    }

    /**
     * Navega a la siguiente opción
     */
    focusNext(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        const nextIndex = instance.focusedIndex < instance.options.length - 1 
            ? instance.focusedIndex + 1 
            : 0;
        this.setFocusedOption(instanceId, nextIndex);
        this.scrollToFocusedOption(instanceId);
    }

    /**
     * Navega a la opción anterior
     */
    focusPrevious(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        const prevIndex = instance.focusedIndex > 0 
            ? instance.focusedIndex - 1 
            : instance.options.length - 1;
        this.setFocusedOption(instanceId, prevIndex);
        this.scrollToFocusedOption(instanceId);
    }

    /**
     * Enfoca la primera opción
     */
    focusFirst(instanceId) {
        this.setFocusedOption(instanceId, 0);
        this.scrollToFocusedOption(instanceId);
    }

    /**
     * Enfoca la última opción
     */
    focusLast(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        this.setFocusedOption(instanceId, instance.options.length - 1);
        this.scrollToFocusedOption(instanceId);
    }

    /**
     * Hace scroll para mostrar la opción enfocada
     */
    scrollToFocusedOption(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance || instance.focusedIndex < 0) return;

        const option = instance.options[instance.focusedIndex];
        option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    /**
     * Maneja la búsqueda typeahead
     */
    handleTypeahead(instanceId, char) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        // Limpiar timeout anterior
        if (instance.typeaheadTimeout) {
            clearTimeout(instance.typeaheadTimeout);
        }

        // Agregar carácter a la cadena de búsqueda
        instance.typeaheadString += char.toLowerCase();

        // Buscar opción que coincida
        const matchIndex = instance.options.findIndex(option => {
            const label = option.querySelector('.custom-select__label').textContent.toLowerCase();
            return label.startsWith(instance.typeaheadString);
        });

        if (matchIndex >= 0) {
            this.setFocusedOption(instanceId, matchIndex);
            this.scrollToFocusedOption(instanceId);
        }

        // Limpiar string después de un delay
        instance.typeaheadTimeout = setTimeout(() => {
            instance.typeaheadString = '';
        }, 1000);
    }

    /**
     * Maneja clics fuera del componente
     */
    handleClickOutside(e) {
        if (this.activeInstanceId) {
            const instance = this.instances.get(this.activeInstanceId);
            if (instance && !instance.element.contains(e.target)) {
                this.close(this.activeInstanceId);
            }
        }
    }

    /**
     * Maneja eventos de teclado globales
     */
    handleKeyDown(e) {
        // Delegar al manejador específico de la instancia activa
        if (this.activeInstanceId) {
            const instance = this.instances.get(this.activeInstanceId);
            if (instance) {
                this.handleInstanceKeyDown(instance, e);
            }
        }
    }

    /**
     * Obtiene el valor actual del selector
     */
    getValue(instanceId) {
        const instance = this.instances.get(instanceId);
        return instance ? instance.element.dataset.value : null;
    }

    /**
     * Establece el valor del selector
     */
    setValue(instanceId, value) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        const optionIndex = instance.options.findIndex(option => 
            option.dataset.value === value
        );

        if (optionIndex >= 0) {
            this.selectOption(instanceId, optionIndex);
        } else {
            // Reset a placeholder si el valor no existe
            this.reset(instanceId);
        }
    }

    /**
     * Resetea el selector al estado inicial
     */
    reset(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        // Limpiar selección
        instance.selectedIndex = -1;
        instance.selectedElement.textContent = instance.config.placeholder;
        instance.element.dataset.value = '';

        // Limpiar opciones seleccionadas
        instance.options.forEach(option => option.setAttribute('aria-selected', 'false'));

        // Resetear select oculto
        instance.hiddenSelect.value = '';

        // Cerrar si está abierto
        if (instance.isOpen) {
            this.close(instanceId);
        }

        // Emitir evento de reset
        this.emit(instance.element, 'custom-select:reset', { instanceId });
    }

    /**
     * Actualiza las opciones del selector
     */
    updateOptions(instanceId, newOptions) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        // Cerrar si está abierto
        if (instance.isOpen) {
            this.close(instanceId);
        }

        // Actualizar configuración
        instance.config.options = newOptions;

        // Regenerar HTML de opciones
        const listHTML = newOptions.map((option, index) => `
            <li class="custom-select__option"
                id="${instance.id}-option-${index}"
                role="option"
                data-value="${option.value}"
                aria-selected="false"
                tabindex="-1">
                ${option.icon ? `<span class="custom-select__icon">${option.icon}</span>` : ''}
                <span class="custom-select__label">${option.label}</span>
            </li>
        `).join('');

        instance.list.innerHTML = listHTML;

        // Actualizar select oculto
        const hiddenHTML = `
            <option value="">${instance.config.placeholder}</option>
            ${newOptions.map(option => `
                <option value="${option.value}">${option.label}</option>
            `).join('')}
        `;
        instance.hiddenSelect.innerHTML = hiddenHTML;

        // Reconfigurar eventos para nuevas opciones
        instance.options = Array.from(instance.list.querySelectorAll('.custom-select__option'));
        instance.options.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectOption(instance.id, index);
            });

            option.addEventListener('mouseenter', () => {
                this.setFocusedOption(instance.id, index);
            });
        });

        // Reset a estado inicial
        this.reset(instanceId);

        // Emitir evento de actualización
        this.emit(instance.element, 'custom-select:update', { instanceId, options: newOptions });
    }

    /**
     * Destruye una instancia del selector
     */
    destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        // Cerrar si está abierto
        if (instance.isOpen) {
            this.close(instanceId);
        }

        // Remover eventos globales si era la instancia activa
        if (this.activeInstanceId === instanceId) {
            this.activeInstanceId = null;
            document.removeEventListener('click', this.bindedHandleClickOutside, true);
            document.removeEventListener('keydown', this.bindedHandleKeyDown, true);
        }

        // Limpiar timeout de typeahead
        if (instance.typeaheadTimeout) {
            clearTimeout(instance.typeaheadTimeout);
        }

        // Remover de la map de instancias
        this.instances.delete(instanceId);

        // Emitir evento de destrucción
        this.emit(instance.element, 'custom-select:destroy', { instanceId });
    }

    /**
     * Emite un evento personalizado
     */
    emit(element, eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    /**
     * Obtiene una instancia por ID
     */
    getInstance(instanceId) {
        return this.instances.get(instanceId);
    }

    /**
     * Obtiene todas las instancias
     */
    getAllInstances() {
        return Array.from(this.instances.values());
    }
}

// Crear instancia global del CustomSelect
window.CustomSelectManager = new CustomSelect();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSelect;
}