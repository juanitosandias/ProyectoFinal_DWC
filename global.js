document.addEventListener('DOMContentLoaded', () => {
    
    // Variables
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.querySelector('.search-bar input');

    let allProducts = [];
    let db;

    // Version 2 BD
    const request = indexedDB.open("CoolCenterDB", 2);

    request.onupgradeneeded = (event) => {
        const dbResult = event.target.result;
        // Crear carrito
        if (!dbResult.objectStoreNames.contains("cart")) {
            dbResult.createObjectStore("cart", { keyPath: "id" });
        }
        // Crear usuario
        if (!dbResult.objectStoreNames.contains("users")) {
            dbResult.createObjectStore("users", { keyPath: "email" });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("DB Conectada en Home");
    };

    // Cargar JSON
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            renderProducts(allProducts);
        })
        .catch(error => console.error("Error JSON:", error));

    function renderProducts(listaProductos) {
        productsContainer.innerHTML = ''; 

        if (listaProductos.length === 0) {
            productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        listaProductos.forEach(prod => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            card.innerHTML = `
                <div class="card-content" onclick="window.location.href='detalle.html?id=${prod.id}'" style="cursor: pointer;">
                    <div class="product-image">
                        <img src="${prod.img}" alt="${prod.nombre}">
                    </div>
                    <div class="product-info">
                        <h4>${prod.nombre}</h4>
                        <p class="category">${prod.categoria}</p>
                        <p class="price">$${prod.precio.toLocaleString()} MXN</p>
                    </div>
                </div>
    
                <div class="card-actions" style="padding: 15px; text-align: center;">
                    <button class="add-cart-btn" data-id="${prod.id}">
                        Añadir al carrito
                    </button>
                </div>
            `;
            productsContainer.appendChild(card);
        });
        asignarEventosBotones();
    }

    // Busqueda
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase();
            const filtrados = allProducts.filter(p => 
                p.nombre.toLowerCase().includes(texto) || 
                p.categoria.toLowerCase().includes(texto)
            );
            renderProducts(filtrados);
        });
    }

    function asignarEventosBotones() {
        const botones = document.querySelectorAll('.add-cart-btn');
        botones.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idProducto = parseInt(e.target.dataset.id);
                addToCart(idProducto);
            });
        });
    }

    function addToCart(id) {
        if (!db) return;

        const productoEncontrado = allProducts.find(p => p.id === id);

        if (productoEncontrado) {
            const transaction = db.transaction(["cart"], "readwrite");
            const store = transaction.objectStore("cart");
            
            // Guardar producto
            const itemParaGuardar = { ...productoEncontrado, seleccionado: true };
            const requestAdd = store.put(itemParaGuardar);

            requestAdd.onsuccess = () => {
                // Toastify de añadido //
                Toastify({
                    text: `✅ ${productoEncontrado.nombre} añadido`,
                    duration: 2000, 
                    gravity: "bottom",
                    position: "right", 
                    style: {
                        background: "#333", 
                        borderRadius: "10px"
                    }
                }).showToast();
            };
        }
    }
});