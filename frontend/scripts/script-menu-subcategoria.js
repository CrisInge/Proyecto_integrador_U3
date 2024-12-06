async function cargarSubcategorias() {
    const params = new URLSearchParams(window.location.search);
    const categoriaId = params.get('id');

    if (!categoriaId) {
        console.error('No se proporcionó el id de la categoría');
        return;
    }

    try {
        const response = await fetch(`https://proyectointegradoru3-production.up.railway.app/api/subcategorias?categoria=${categoriaId}`);
        const subcategorias = await response.json();

        const container = document.querySelector('.option-menu-container');
        container.innerHTML = ''; // Limpiar contenido previo

        subcategorias.forEach(sub => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.style.backgroundImage = `url(${sub.imagen})`;

            card.innerHTML = `
                <div class="card__content">
                    <h3 class="card__title">${sub.nombre}</h3>
                    <p class="card__description">${sub.descripcion}</p>
                    <p style="color: green; font-weight: bold;">Precio: $${sub.precio}</p>
                    <button class="btn-agregar" data-id="${sub.id}" data-nombre="${sub.nombre}" data-precio="${sub.precio}">
                        Realizar pedido
                    </button>
                </div>
            `;

            // Agregar evento al botón de agregar al pedido
            card.querySelector('.btn-agregar').addEventListener('click', function() {
                const cantidad = prompt("¿Cuántos deseas pedir?");
                if (cantidad && !isNaN(cantidad) && cantidad > 0) {
                    realizarPedido(sub.id, sub.nombre, sub.precio, cantidad);
                } else {
                    alert("Por favor ingresa una cantidad válida.");
                }
            });

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar las subcategorías:', error);
    }
}document.addEventListener('DOMContentLoaded', cargarSubcategorias);




/* ----------------------------------------------------------------------------- */

async function realizarPedido(idSubcategoria, nombrePlatillo, precio, cantidad) {
    const total = precio * cantidad;
    const nombreCliente = prompt("Ingresa tu nombre:");

    const pedido = {
        id_subcategoria: idSubcategoria,
        nombre_cliente: nombreCliente,
        cantidad: cantidad,
        total: total,
        nombre_platillo: nombrePlatillo
    };

    try {
        const response = await fetch('https://proyectointegradoru3-production.up.railway.app/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        const data = await response.json();

        if (data.success) {
            alert("¡Pedido realizado con éxito!");
            mostrarTicketPopUp(data.ticket); // Llamada para mostrar el ticket en el pop-up
        } else {
            alert("Hubo un error al realizar el pedido.");
        }
    } catch (error) {
        console.error('Error al realizar el pedido:', error);
        alert("Hubo un error al realizar el pedido.");
    }
}

function mostrarTicketPopUp(ticket) {
    // Mostrar el modal
    const modal = document.getElementById("ticketModal");
    const clienteName = document.getElementById("clienteName");
    const platilloName = document.getElementById("platilloName");
    const cantidad = document.getElementById("cantidad");
    const total = document.getElementById("total");
    const pedidoId = document.getElementById("pedidoId");

    // Actualizar el contenido del modal
    clienteName.innerHTML = `<strong>Cliente:</strong> ${ticket.nombre_cliente}`;
    platilloName.innerHTML = `<strong>Platillo:</strong> ${ticket.nombre_platillo}`;
    cantidad.innerHTML = `<strong>Cantidad:</strong> ${ticket.cantidad}`;
    total.innerHTML = `<strong>Total a pagar:</strong> $${ticket.total}`;
    pedidoId.innerHTML = `<strong>No. de Orden:</strong> ${ticket.id_pedido}`;

    // Mostrar el modal
    modal.style.display = "block";

    // Cuando el usuario haga clic en el botón de cerrar, cerrar el modal
    const closeBtn = document.querySelector(".close-btn");
    closeBtn.onclick = function () {
        modal.style.display = "none";
    }

    // También cerrar el modal si el usuario hace clic fuera del contenido del modal
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

/* -------------------------------------------------------------------------------- */

confirmarCancelacionBtn.addEventListener("click", async () => {
    const pedidoId = document.getElementById("pedidoIdInput").value;
    const razonCancelacion = document.getElementById("razonInput").value;

    if (!pedidoId || !razonCancelacion) {
        alert("Por favor, ingresa un número de pedido y una razón válida.");
        return;
    }

    try {
        const response = await fetch(`https://proyectointegradoru3-production.up.railway.app/api/pedidos/${pedidoId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ razon: razonCancelacion }) // Enviar la razón al backend
        });

        const data = await response.json();

        if (data.success) {
            alert("Pedido cancelado con éxito.");
            cancelarPedidoModal.style.display = "none"; // Cerrar el modal
        } else {
            alert(data.message || "Error al cancelar el pedido.");
        }
    } catch (error) {
        console.error("Error al cancelar el pedido:", error);
        alert("Hubo un error al intentar cancelar el pedido.");
    }
});

/* -------------------------------------------------------------------------------- */

// Obtener elementos del DOM
const cancelarPedidoBtn = document.getElementById("cancelarPedidoBtn");
const cancelarPedidoModal = document.getElementById("cancelarPedidoModal");
const closeCancelBtn = document.querySelector(".close-cancel-btn");

// Mostrar el modal al hacer clic en el botón "Cancelar Pedidos"
cancelarPedidoBtn.addEventListener("click", () => {
    cancelarPedidoModal.style.display = "block"; // Mostrar el modal
});

// Cerrar el modal al hacer clic en el botón de cierre
closeCancelBtn.addEventListener("click", () => {
    cancelarPedidoModal.style.display = "none"; // Ocultar el modal
});

// Cerrar el modal si el usuario hace clic fuera del contenido del modal
window.addEventListener("click", (event) => {
    if (event.target === cancelarPedidoModal) {
        cancelarPedidoModal.style.display = "none"; // Ocultar el modal
    }
});



