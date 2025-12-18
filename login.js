document.addEventListener('DOMContentLoaded', () => {
    
    // Config BD
    const dbName = "CoolCenterDB";
    const dbVersion = 2; 
    let db;

    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        // Guardar datos en Api IndexDB //
        if (!db.objectStoreNames.contains("users")) {
            // El email será la llave única //
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

    // Switch Login/Registro //
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active'); // Animación //
        setTimeout(() => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            setTimeout(() => registerForm.classList.add('active'), 10);
        }, 300);
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

    // REGISTRO //
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores y quitar espacios vacíos //
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-pass').value.trim();

        // Campos obligatorios //
        if (!name || !email || !password) {
            mostrarToast("Por favor completa todos los campos", "error");
            return;
        }

        // Password encriptado //
        const encryptedPass = btoa(password);

        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");
        
        const newUser = { name, email, password: encryptedPass };
        const addReq = store.add(newUser);

        addReq.onsuccess = () => {
            // Registro exitoso //
            mostrarToast("¡Registro exitoso! Inicia sesión", "success");
            
            // Redirigir a login //
            registerForm.reset();
            showLoginBtn.click(); 
        };

        addReq.onerror = () => {
            // Validación extra: Si el email ya existe //
            mostrarToast("Este correo ya está registrado", "error");
        };
    });

    // LOGIN //
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-pass').value.trim();
        const encryptedPass = btoa(password);

        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        
        // Buscamos al usuario por su email
        const getReq = store.get(email);

        getReq.onsuccess = () => {
            const user = getReq.result;

            // Validar usuario/contraseña //
            if (user && user.password === encryptedPass) {
                mostrarToast("Bienvenido " + user.name, "success");
                
                // Guardar sesión //
                localStorage.setItem("userSesion", JSON.stringify(user));

                // Redirigir a Pagina Principal //
                setTimeout(() => window.location.href = "home.html", 1500);
            } else {
                mostrarToast("Usuario o contraseña incorrectos", "error");
            }
        };

        getReq.onerror = () => {
            mostrarToast("Error al conectar con la base de datos", "error");
        };
    });

    // Función Toastify
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