

// Ações locais: não enviam alterações nem exclusões para a API.
function addCardActions(card, fieldLabels) {
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "card-action-button edit";
    editButton.title = "Editar conta";
    editButton.setAttribute("aria-label", "Editar conta");
    editButton.innerHTML = '<i class="bi bi-pencil-square" aria-hidden="true"></i>';
    editButton.addEventListener("click", () => {
        const cells = Array.from(card.children).filter((element) => element !== actions);
        const changes = [];

        for (let index = 0; index < cells.length; index += 1) {
            const currentValue = cells[index].textContent.trim();
            const nextValue = window.prompt(`Editar ${fieldLabels[index] || "campo"}:`, currentValue);
            if (nextValue === null) return;
            changes.push(nextValue.trim());
        }

        cells.forEach((cell, index) => {
            cell.textContent = changes[index];
            cell.title = changes[index];
        });
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "card-action-button delete";
    deleteButton.title = "Excluir conta da visualização";
    deleteButton.setAttribute("aria-label", "Excluir conta da visualização");
    deleteButton.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i>';
    deleteButton.addEventListener("click", () => {
        if (window.confirm("Remover esta conta da visualização? Essa ação não exclui o registro do banco de dados.")) {
            card.remove();
        }
    });

    actions.append(editButton, deleteButton);
    card.append(actions);
}
const amountInput = document.querySelector("#payable-amount");
amountInput.addEventListener("input", (event) => {
    let value = event.target.value;
    value = value.replace(/\D/g, "");
    value = (value / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    event.target.value = value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
});

const form = document.querySelector("#formAccountsPayable");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const description = form.elements["description"].value.trim();
    const payable_supplier = form.elements["payable_supplier"].value.trim();
    const category = form.elements["category"].value.trim();
    const amount = form.elements["amount"].value.trim().replace(".", "").replace(",", ".");
    const due_date = form.elements["due_date"].value.trim();
    const status = form.elements["status"].value.trim();
    const payable_method = form.elements["payable_method"].value.trim();
    const notes = form.elements["notes"].value.trim();

    const response = await fetch(
        "http://127.0.0.1:5000/data/accounts-payable",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description,
                payable_supplier,
                category,
                amount,
                due_date,
                status,
                payable_method,
                notes
            })
        }
    );

    const data = await response.json();

    if (data["message"] === "success") {
        window.location.reload();
    }

    console.log(data);
});


const dataAccountsReceivable = async () => {
    const response = await fetch(
        "http://127.0.0.1:5000/data/accounts-payable/data-user",
        {
            method: "GET",
            credentials: "include"
        }
    );

    const data = await response.json();

    const totalPendenteGrafico = data["totalPendente"];
    const totalPagoGrafico = data["totalPago"];
    const totalAtrasadoGrafico = data["totalAtrasado"];

    var options = {
        chart: { type: 'pie' },
        series: [Number(totalPendenteGrafico), Number(totalPagoGrafico), Number(totalAtrasadoGrafico)],
        labels: ['Pendente', 'Pago', 'Vencido']
    }

    var chart = new window.ApexCharts(document.querySelector('#chart-pie'), options)
    chart.render()

    const container = document.querySelector("#dataUser");

    data.dataUser.forEach(account => {

        const totalPagarObjeto = new Number(data["totalPagar"])
        const totalPagarReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalPagarObjeto);

        const totalPagarElement = document.querySelector("#total-pagar");
        totalPagarElement.textContent = totalPagarReais;


        const totalPagoObjeto = new Number(data["totalPago"])
        const totalPagoReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalPagoObjeto);

        const totalPagoElement = document.querySelector("#total-pago");
        totalPagoElement.textContent = totalPagoReais;

        const totalPendenteObjeto = new Number(data["totalPendente"])
        const totalPendenteReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalPendenteObjeto);

        const totalPendenteElement = document.querySelector("#total-pendente");
        totalPendenteElement.textContent = totalPendenteReais;

        const totalAtrasadoObjeto = new Number(data["totalAtrasado"])
        const totalAtrasadoReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalAtrasadoObjeto);

        const totalAtrasadoElement = document.querySelector("#total-atrasado");
        totalAtrasadoElement.textContent = totalAtrasadoReais;

        const card = document.createElement("div");
        card.classList.add("cardData");

        const description = document.createElement("div");
        const category = document.createElement("div");
        const payable_supplier = document.createElement("div");
        const amount = document.createElement("div");
        const due_date = document.createElement("div");
        const status = document.createElement("div");
        const notes = document.createElement("div");

        const dataObjeto = new Date(account[6])
        const dataFormatada = new Intl.DateTimeFormat('pt-br', {
            timeZone: 'UTC'
        }).format(dataObjeto)

        const reaisObjeto = new Number(account[5])
        const valorReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(reaisObjeto);

        description.textContent = account[2];
        category.textContent = account[3];
        payable_supplier.textContent = account[4];
        amount.textContent = valorReais;
        due_date.textContent = dataFormatada;
        status.textContent = account[7];
        notes.textContent = account[9];

        card.append(
            description,
            category,
            payable_supplier,
            amount,
            due_date,
            status,
            notes
        );

        addCardActions(card, ["Descrição","Categoria","Fornecedor","Valor","Vencimento","Status","Observação"]);

        container.append(card);
    });
};

dataAccountsReceivable();

var options = {
    chart: {
        type: 'area',
        with: 100,
        height: 200,
        toolbar: {
            show: false
        }
    },

    colors: ['#22c55e'],

    series: [{ name: 'Revenue', data: [10, 9, 8, 5, 5, 6, 9, 6, 7, 9, 10, 11] }],
    xaxis: { categories: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] }
}

var chart = new window.ApexCharts(document.querySelector('#chart-column'), options)
chart.render()