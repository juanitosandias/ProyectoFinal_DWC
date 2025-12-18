// Variables 
let productosCarrito = [];
const itemsContainer = document.getElementById('cart-items-container');
const summaryList = document.getElementById('summary-list');
const totalPriceEl = document.getElementById('total-price');

// Conexión a DB //
const dbName = "CoolCenterDB";
let db;

// BD Version 2 //
const request = indexedDB.open(dbName, 2);

request.onsuccess = (e) => {
    db = e.target.result;
    console.log("DB Conectada en Carrito");
    cargarCarritoDesdeDB();
};

request.onerror = (e) => {
    console.error("Error abriendo DB en carrito:", e);
};

// 1. LEER DE INDEXEDDB
function cargarCarritoDesdeDB() {
    // Verificar si existe el carrito //
    if (!db.objectStoreNames.contains("cart")) {
        console.log("El almacén 'cart' no existe todavía.");
        itemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        return;
    }

    const tx = db.transaction(["cart"], "readonly");
    const store = tx.objectStore("cart");
    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
        productosCarrito = getAllReq.result;
        renderItems();
        updateSummary();
    };
}

// DIBUJAR //
function renderItems() {
    itemsContainer.innerHTML = '';

    if(productosCarrito.length === 0) {
        itemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        updateSummary(); // Limpiar resumen //
        return;
    }

    productosCarrito.forEach(producto => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        if(producto.seleccionado) itemDiv.classList.add('selected');

        itemDiv.innerHTML = `
            <input type="checkbox" class="item-checkbox" 
                data-id="${producto.id}" 
                ${producto.seleccionado ? 'checked' : ''}>
            
            <div class="item-img-placeholder">
                <img src="${producto.img}" alt="${producto.nombre}">
            </div>
            
            <div class="item-info">
                <h4>${producto.nombre}</h4>
                <p class="price">$${producto.precio.toLocaleString()} MXN</p>
            </div>
            
            <button class="icon-btn delete-btn" data-id="${producto.id}" style="color:red">
                <i class="fas fa-trash"></i>
            </button>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    // Eventos
    document.querySelectorAll('.item-checkbox').forEach(box => {
        box.addEventListener('change', (e) => toggleSelect(parseInt(e.target.dataset.id)));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').dataset.id);
            eliminarDelCarrito(id);
        });
    });
}

// ACTUALIZAR ESTADO //
function toggleSelect(id) {
    const producto = productosCarrito.find(p => p.id === id);
    if (producto) {
        producto.seleccionado = !producto.seleccionado;
        renderItems();
        updateSummary();
    }
}

// ELIMINAR //
function eliminarDelCarrito(id) {
    const tx = db.transaction(["cart"], "readwrite");
    const store = tx.objectStore("cart");
    store.delete(id);

    tx.oncomplete = () => {
        // Recargar la lista desde la BD //
        cargarCarritoDesdeDB();
        Toastify({
            text: "Producto eliminado",
            duration: 2000,
            style: { background: "#ff5f6d" }
        }).showToast();
    };
}

// RESUMEN //
function updateSummary() {
    summaryList.innerHTML = '';
    let total = 0;
    
    // Sumamos si hay items en el carrito
    if(productosCarrito.length > 0) {
        const seleccionados = productosCarrito.filter(p => p.seleccionado);

        seleccionados.forEach(p => {
            const row = document.createElement('div');
            row.classList.add('summary-item');
            row.innerHTML = `<span>${p.nombre}</span><span>$${p.precio.toLocaleString()}</span>`;
            summaryList.appendChild(row);
            total += p.precio;
        });
    }

    totalPriceEl.textContent = `$${total.toLocaleString()} MXN`;
}