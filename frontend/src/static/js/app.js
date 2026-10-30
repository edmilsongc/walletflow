/*
 * Estrutura visual comum do WalletFlow.
 *
 * Contrato para integração:
 * document.addEventListener('walletflow:form-submit', event => {
 *   // event.detail.name    -> valor de data-form-event no <form>
 *   // event.detail.values  -> campos do formulário em um objeto
 * });
 * document.addEventListener('walletflow:export-dashboard', event => {
 *   // event.detail.format -> "xlsx" ou "pdf"
 *   // event.detail.values -> período selecionado no formulário de exportação
 * });
 */
'use strict';

/** Elementos HTML comuns: data, item ativo do menu e menu móvel. */
function initializeLayout() {
    const date = document.getElementById('topbar-date');
    if (date) {
        const value = new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }).format(new Date());
        date.textContent = value.charAt(0).toUpperCase() + value.slice(1);
    }

    const page = document.body.dataset.page;
    document.querySelector(`[data-nav="${page}"]`)?.classList.add('active');

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeMenu = () => document.body.classList.remove('menu-open');
    document.getElementById('menu-toggle')?.addEventListener('click', () => document.body.classList.add('menu-open'));
    overlay?.addEventListener('click', closeMenu);
    sidebar?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

    // Campo #topbar-search-input do cabeçalho: filtra somente os itens de menu.
    // Ele não consulta dados nem altera tabelas; a busca de cada página pode
    // escutar o evento global do formulário quando precisar de uma API própria.
    const search = document.getElementById('topbar-search-input');
    search?.addEventListener('input', () => {
        const term = search.value.trim().toLocaleLowerCase('pt-BR');
        document.querySelectorAll('.nav-item').forEach(item => {
            item.hidden = Boolean(term) && !item.textContent.toLocaleLowerCase('pt-BR').includes(term);
        });
    });
}

/** Botões data-modal-open e data-modal-close controlam somente a visibilidade do modal HTML. */
function initializeModals() {
    document.querySelectorAll('[data-modal-open]').forEach(button => {
        button.addEventListener('click', () => document.getElementById(button.dataset.modalOpen)?.classList.add('open'));
    });
    document.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', () => button.closest('.modal-overlay')?.classList.remove('open'));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('open'); });
    });
}

/** Abas visuais: grupos com data-tabs e botões com data-tab. */
function initializeTabs() {
    document.querySelectorAll('[data-tabs]').forEach(group => {
        group.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
            group.querySelectorAll('[data-tab]').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            group.dispatchEvent(new CustomEvent('walletflow:tab-change', { bubbles: true, detail: { value: button.dataset.tab } }));
        }));
    });
}

/**
 * Formulários HTML: impede o envio nativo e entrega os campos à aplicação.
 */
function initializeForms() {
    document.querySelectorAll('form[data-form-event]').forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const values = Object.fromEntries(new FormData(form).entries());
            form.dispatchEvent(new CustomEvent('walletflow:form-submit', {
                bubbles: true, detail: { name: form.dataset.formEvent, values, form }
            }));
        });
    });
}

/** Controles de exportação do dashboard. */
function initializeExports() {
    document.querySelectorAll('[data-export-format]').forEach(button => {
        button.addEventListener('click', () => {
            const form = button.closest('form');
            const values = form ? Object.fromEntries(new FormData(form).entries()) : {};
            button.dispatchEvent(new CustomEvent('walletflow:export-dashboard', {
                bubbles: true, detail: { format: button.dataset.exportFormat, values, button }
            }));
        });
    });
}

/** Painel de notificações do cabeçalho. O conteúdo será preenchido pela sua API. */
function initializeNotifications() {
    const trigger = document.getElementById('notifications-trigger');
    const panel = document.getElementById('notifications-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.notifications')) {
            trigger.setAttribute('aria-expanded', 'false');
            panel.hidden = true;
        }
    });
}

/** Mensagem opcional para integrações: window.WalletFlowUI.showToast('...'). */
function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeLayout();
    initializeModals();
    initializeTabs();
    initializeForms();
    initializeExports();
    initializeNotifications();
});

window.WalletFlowUI = { showToast };

const dataUser = async () => {
    const profileName = document.querySelector("#perfilUser");
    if (!profileName) return;

    try {
        const response = await fetch("/api/dashboard", {
            method: "GET",
            credentials: "same-origin"
        });
        if (!response.ok) return;

        const data = await response.json();
        profileName.textContent = Array.isArray(data.user) ? data.user[0] || "Perfil" : data.user || "Perfil";
    } catch (error) {
        console.error("Não foi possível carregar o perfil:", error);
    }
}
dataUser();