document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.textContent = 'Enviando mensaje...';

    // Recopilar datos del formulario
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            responseMessage.textContent = result.message;
            e.target.reset(); // Limpiar el formulario
        } else {
            responseMessage.textContent = 'Error: ' + result.message;
        }
    } catch (error) {
        console.error('Error:', error);
        responseMessage.textContent = 'Error enviando el mensaje.';
    }
});


/* ------------------------------------------------------------------------ */


/* avatar ------------------------------------------------------------ */











/* funcion para mostrar tarjetas ------------------------------------------------------------------------------------------------------------ */






