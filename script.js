document.addEventListener('DOMContentLoaded', () => {
    // State
    let columns = [
        { id: 0, title: 'Column 1', color: '#ffffff' },
        { id: 1, title: 'Column 2', color: '#ffffff' },
        { id: 2, title: 'Column 3', color: '#ffffff' }
    ];
    let draggedItem = null;
    let editingColumnId = null;

    // DOM Elements
    const gridContainer = document.getElementById('grid-container');
    const columnCountInput = document.getElementById('column-count');
    const decreaseBtn = document.getElementById('decrease-cols');
    const increaseBtn = document.getElementById('increase-cols');
    const reorderInput = document.getElementById('reorder-input');
    const applyOrderBtn = document.getElementById('apply-order');
    
    // Modal Elements
    const modal = document.getElementById('edit-modal');
    const editTitleInput = document.getElementById('edit-title');
    const editColorPicker = document.getElementById('edit-color-picker');
    const editColorText = document.getElementById('edit-color-text');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');

    // Initialize
    renderGrid();
    updateControls();

    // Event Listeners
    decreaseBtn.addEventListener('click', () => updateColumnCount(-1));
    increaseBtn.addEventListener('click', () => updateColumnCount(1));
    columnCountInput.addEventListener('change', (e) => setColumnCount(parseInt(e.target.value)));
    applyOrderBtn.addEventListener('click', applyReorder);
    
    // Modal Listeners
    saveEditBtn.addEventListener('click', saveColumnEdit);
    cancelEditBtn.addEventListener('click', closeModal);
    editColorPicker.addEventListener('input', (e) => editColorText.value = e.target.value);
    editColorText.addEventListener('input', (e) => editColorPicker.value = e.target.value);

    // Functions

    function renderGrid() {
        gridContainer.innerHTML = '';
        
        // Update Grid Columns CSS
        gridContainer.style.gridTemplateColumns = `repeat(${columns.length}, 1fr)`;

        columns.forEach((col, index) => {
            const colEl = document.createElement('div');
            colEl.className = 'grid-column';
            colEl.draggable = true;
            colEl.dataset.id = col.id;
            colEl.dataset.index = index;
            colEl.style.backgroundColor = col.color;

            colEl.innerHTML = `
                <div class="column-header">
                    <span class="column-title">${col.title}</span> <!-- Removed index prefix to look cleaner, can add back if needed -->
                    <button class="edit-btn" onclick="openEditModal(${col.id})">Edit</button>
                </div>
                <div class="column-content">
                    <p>Item ${col.id + 1}</p>
                </div>
            `;

            // Drag Events
            colEl.addEventListener('dragstart', handleDragStart);
            colEl.addEventListener('dragover', handleDragOver);
            colEl.addEventListener('drop', handleDrop);
            colEl.addEventListener('dragend', handleDragEnd);

            gridContainer.appendChild(colEl);
        });

        // Update inputs to reflect state
        columnCountInput.value = columns.length;
        reorderInput.placeholder = columns.map(c => c.id).join(', ');
    }

    function updateColumnCount(change) {
        const newCount = columns.length + change;
        if (newCount >= 1 && newCount <= 12) {
            if (change > 0) {
                // Add column
                const newId = columns.length > 0 ? Math.max(...columns.map(c => c.id)) + 1 : 0;
                columns.push({ id: newId, title: `Column ${newId + 1}`, color: '#ffffff' });
            } else {
                // Remove last column
                columns.pop();
            }
            renderGrid();
        }
    }

    function setColumnCount(count) {
        if (count < 1) count = 1;
        if (count > 12) count = 12;
        
        while (columns.length < count) {
             const newId = columns.length > 0 ? Math.max(...columns.map(c => c.id)) + 1 : 0;
             columns.push({ id: newId, title: `Column ${newId + 1}`, color: '#ffffff' });
        }
        while (columns.length > count) {
            columns.pop();
        }
        renderGrid();
    }

    function applyReorder() {
        const orderStr = reorderInput.value.trim();
        if (!orderStr) return;

        const orderIds = orderStr.split(',').map(s => parseInt(s.trim()));
        
        // Validate
        if (orderIds.length !== columns.length) {
            alert('Number of IDs must match number of columns');
            return;
        }

        // Check if all IDs exist
        const currentIds = columns.map(c => c.id);
        const isValid = orderIds.every(id => currentIds.includes(id)) && new Set(orderIds).size === orderIds.length;

        if (!isValid) {
            alert('Invalid IDs or detailed duplicates. Please use existing column IDs.');
            return;
        }

        // Reorder
        const newColumns = [];
        orderIds.forEach(id => {
            newColumns.push(columns.find(c => c.id === id));
        });
        columns = newColumns;
        renderGrid();
    }

    // Drag and Drop
    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        e.stopPropagation();
        if (draggedItem !== this) {
            const fromIndex = parseInt(draggedItem.dataset.index);
            const toIndex = parseInt(this.dataset.index);
            
            // Move item in array
            const itemToMove = columns[fromIndex];
            columns.splice(fromIndex, 1);
            columns.splice(toIndex, 0, itemToMove);
            
            renderGrid();
        }
        return false;
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    // Editing
    window.openEditModal = function(id) { // Attach to window for onclick access
        const column = columns.find(c => c.id === id);
        if (!column) return;

        editingColumnId = id;
        editTitleInput.value = column.title;
        editColorPicker.value = column.color;
        editColorText.value = column.color;
        
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        editingColumnId = null;
    }

    function saveColumnEdit() {
        if (editingColumnId === null) return;

        const column = columns.find(c => c.id === editingColumnId);
        if (column) {
            column.title = editTitleInput.value;
            column.color = editColorText.value; // Prefer text input for flexibility
            renderGrid();
        }
        closeModal();
    }

    function updateControls() {
        // Any specific control updates
    }
});
