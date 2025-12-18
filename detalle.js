document.addEventListener('DOMContentLoaded', () => {
    // Obtener ID de la URL //
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    let currentProduct = null;
    let db;

    //  INICIALIZAR DB ===
    const request = indexedDB.open("CoolCenterDB", 2);
    request.onsuccess = (e) => { db = e.target.result; };

    // CARGAR DATOS //
    fetch('productos.json')
        .then(res => res.json())
        .then(data => {
            currentProduct = data.find(p => p.id === productId);
            if(currentProduct) {
                renderDetalle(currentProduct);
                renderSimilares(data, currentProduct.categoria);
            } else {
                document.querySelector('.detail-container').innerHTML = "<h2>Producto no encontrado</h2>";
            }
        });

    // PINTAR DATOS EN PANTALLA
    function renderDetalle(prod) {
        // Datos básicos
        document.getElementById('main-img').src = prod.img;
        document.getElementById('prod-name').textContent = prod.nombre;
        
        const precioFormateado = `$${prod.precio.toLocaleString()} MXN`;
        document.getElementById('prod-price').textContent = precioFormateado;
        document.getElementById('summary-price').textContent = precioFormateado;
        
        // Descripción
        const descElement = document.getElementById('prod-desc');
        descElement.textContent = prod.descripcion ? prod.descripcion : "Sin descripción disponible.";

        document.getElementById('prod-marca').textContent = prod.marca || "Genérica";
        document.getElementById('prod-modelo').textContent = prod.modelo || "N/A";
        document.getElementById('prod-stock').textContent = prod.stock ? `${prod.stock} unidades` : "Agotado";
        document.getElementById('prod-garantia').textContent = prod.garantia || "Sin garantía";

        // Lógica visual de Stock
        if (!prod.stock || prod.stock === 0) {
            document.getElementById('prod-stock').style.color = "red";
            document.getElementById('btn-add-detail').disabled = true; 
            document.getElementById('btn-add-detail').textContent = "Agotado";
            document.getElementById('btn-add-detail').style.backgroundColor = "#ccc";
        }
    }

    // AÑADIR AL CARRITO //
    document.getElementById('btn-add-detail').addEventListener('click', () => {
        if(!db) return;
        
        const transaction = db.transaction(["cart"], "readwrite");
        const store = transaction.objectStore("cart");
        const item = { ...currentProduct, seleccionado: true };
        
        store.put(item);

        Toastify({
            text: `✅ ${currentProduct.nombre} añadido`,
            duration: 2000,
            style: { background: "#333" }
        }).showToast();
    });

    // PRODUCTOS SIMILARES //
    function renderSimilares(allProducts, categoria) {
        const container = document.getElementById('similar-container');
        // Filtrar //
        const similares = allProducts.filter(p => p.categoria === categoria && p.id !== productId).slice(0, 4);

        similares.forEach(prod => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            // Reutilizar estilo de tarjeta pequeña
            card.innerHTML = `
                <div class="product-image" style="height: 120px;">
                    <img src="${prod.img}" style="width:100%; height:100%; object-fit:contain;">
                </div>
                <div class="product-info">
                    <h5>${prod.nombre}</h5>
                    <p class="price">$${prod.precio}</p>
                    <a href="detalle.html?id=${prod.id}" class="btn" style="display:block; text-align:center; font-size:0.8rem;">Ver</a>
                </div>
            `;
            container.appendChild(card);
        });
    }
});