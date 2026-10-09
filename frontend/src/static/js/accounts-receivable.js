

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
const amountInput = document.querySelector("#receivable-amount");
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

const form = document.querySelector("#formAccountsReceivable");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const description = form.elements["description"].value.trim();
    const category = form.elements["category"].value.trim();
    const amount = form.elements["amount"].value.trim().replace(".", "").replace(",", ".");
    const due_date = form.elements["due_date"].value.trim();
    const status = form.elements["status"].value.trim();
    const frequency = form.elements["frequency"].value.trim();
    const notes = form.elements["notes"].value.trim();

    const response = await fetch(
        "http://127.0.0.1:5000/data/accounts-receivable",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description,
                category,
                amount,
                due_date,
                status,
                frequency,
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
        "http://127.0.0.1:5000/data/accounts-receivable/data-user",
        {
            method: "GET",
            credentials: "include"
        }
    );

    const data = await response.json();

    // console.log(data["totalPendente"], data["totalRecebido"], data["totalAtrasado"]);

    const totalPendenteGrafico = data["totalPendente"];
    const totalRecebidoGrafico = data["totalRecebido"];
    const totalAtrasadoGrafico = data["totalAtrasado"];

    var options = {
        chart: { type: 'pie' },
        series: [Number(totalPendenteGrafico), Number(totalRecebidoGrafico), Number(totalAtrasadoGrafico)],
        labels: ['Pendente', 'Recebido', 'Em atraso']
    }

    var chart = new window.ApexCharts(document.querySelector('#chart-pie'), options)
    chart.render()

    const container = document.querySelector("#dataUser");

    data.dataUser.forEach(account => {

        const totalReceberObjeto = new Number(data["totalReceber"])
        const totalReceberReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalReceberObjeto);

        const totalReceber = document.querySelector("#total-receber");
        totalReceber.textContent = totalReceberReais;


        const totalPendenteObjeto = new Number(data["totalPendente"])
        const totalPendenteReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalPendenteObjeto);

        const totalPendente = document.querySelector("#total-pendente");
        totalPendente.textContent = totalPendenteReais;


        const totalRecebidoObjeto = new Number(data["totalRecebido"])
        const totalRecebidoReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalRecebidoObjeto);

        const totalRecebido = document.querySelector("#total-recebido");
        totalRecebido.textContent = totalRecebidoReais;


        const totalAtrasadoObjeto = new Number(data["totalAtrasado"])
        const totalAtrasadoReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalAtrasadoObjeto);

        const totalAtrasado = document.querySelector("#total-atrasado");
        totalAtrasado.textContent = totalAtrasadoReais;

        const card = document.createElement("div");
        card.classList.add("cardData");

        const description = document.createElement("div");
        const category = document.createElement("div");
        const amount = document.createElement("div");
        const due_date = document.createElement("div");
        const status = document.createElement("div");
        const frequency = document.createElement("div");
        const notes = document.createElement("div");

        const dataObjeto = new Date(account[5])
        const dataFormatada = new Intl.DateTimeFormat('pt-br', {
            timeZone: 'UTC'
        }).format(dataObjeto)

        const reaisObjeto = new Number(account[4])
        const valorReais = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(reaisObjeto);



        description.textContent = account[3];
        category.textContent = account[2];
        amount.textContent = valorReais;
        due_date.textContent = dataFormatada;
        status.textContent = account[6];
        frequency.textContent = account[7];
        notes.textContent = account[8];

        card.append(
            description,
            category,
            amount,
            due_date,
            status,
            frequency,
            notes
        );

        addCardActions(card, ["Descrição","Categoria","Valor","Vencimento","Status","Frequência","Observação"]);

        container.append(card);
    });
};

dataAccountsReceivable();

var options = {
    chart: {
        type: 'area',
        width: '100%',
        height: 200,
        toolbar: {
            show: false
        }
    },

    colors: ['#22c55e'],

    series: [{ name: 'Revenue', data: [1, 2, 2, 0, 4, 5, 9, 3, 4, 1, 3, 4] }],
    xaxis: { categories: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] }
}

var chart = new window.ApexCharts(document.querySelector('#chart-column'), options)
chart.render()