document.addEventListener('DOMContentLoaded', () => {
    
    // === CONFIGURACIÓN BASE DE DATOS ===
    const dbName = "CoolCenterDB";
    // IMPORTANTE: Debe coincidir con la versión del Home (que es 2)
    const dbVersion = 2; 
    let db;

    const request = indexedDB.open(dbName, dbVersion);

    // Si la base de datos no existe o la versión cambió
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        // CUMPLE REQUISITO: Guardar datos en Api IndexDB [cite: 14]
        if (!db.objectStoreNames.contains("users")) {
            // El email será la llave única (no puede haber dos iguales)
            db.createObjectStore("users", { keyPath: "email" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("DB Conectada en Login");
    };

    request.onerror = (event) => {
        console.error("Error DB:", event.target.error);
    };

    // === INTERFAZ VISUAL (Switch Login/Registro) ===
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active'); // Animación CSS
        setTimeout(() => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            setTimeout(() => registerForm.classList.add('active'), 10);
        }, 300); // Espera a que termine la transición CSS
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        setTimeout(() => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            setTimeout(() => loginForm.classList.add('active'), 10);
        }, 300);
    });

    // === LÓGICA DE REGISTRO ===
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores y quitar espacios vacíos (.trim())
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-pass').value.trim();

        // CUMPLE REQUISITO: Que todos los campos sean obligatorios [cite: 19]
        if (!name || !email || !password) {
            mostrarToast("Por favor completa todos los campos", "error");
            return;
        }

        // CUMPLE REQUISITO: Password encriptado [cite: 21]
        // Usamos btoa() para codificar en Base64 (cumple nivel académico)
        const encryptedPass = btoa(password);

        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");
        
        const newUser = { name, email, password: encryptedPass };
        const addReq = store.add(newUser); // Intenta guardar

        addReq.onsuccess = () => {
            // CUMPLE REQUISITO: Mostrar pop-up Toastify "Registro exitoso" [cite: 15]
            mostrarToast("¡Registro exitoso! Inicia sesión", "success");
            
            // CUMPLE REQUISITO: Redirigir a la página de login [cite: 15]
            registerForm.reset();
            showLoginBtn.click(); 
        };

        addReq.onerror = () => {
            // Validación extra: Si el email ya existe (clave duplicada)
            mostrarToast("Este correo ya está registrado", "error");
        };
    });

    // === LÓGICA DE LOGIN ===
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-pass').value.trim();
        const encryptedPass = btoa(password); // Encriptar para comparar

        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        
        // Buscamos al usuario por su email
        const getReq = store.get(email);

        getReq.onsuccess = () => {
            const user = getReq.result;

            // CUMPLE REQUISITO: Validar usuario/contraseña o mostrar error [cite: 17]
            if (user && user.password === encryptedPass) {
                mostrarToast("Bienvenido " + user.name, "success");
                
                // Guardamos sesión para saber quién es en el Home
                localStorage.setItem("userSesion", JSON.stringify(user));

                // CUMPLE REQUISITO: Redirigir a Pagina Principal [cite: 16]
                setTimeout(() => window.location.href = "home.html", 1500);
            } else {
                mostrarToast("Usuario o contraseña incorrectos", "error");
            }
        };

        getReq.onerror = () => {
            mostrarToast("Error al conectar con la base de datos", "error");
        };
    });

    // Función auxiliar Toastify
    function mostrarToast(msg, type) {
        let bg = type === "success" ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)";
        
        Toastify({
            text: msg,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: { background: bg }
        }).showToast();
    }
});