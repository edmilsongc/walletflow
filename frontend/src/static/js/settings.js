'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (!event.detail.name.startsWith('settings:')) return;
    document.dispatchEvent(new CustomEvent('walletflow:settings-form-ready', {
        detail: event.detail
    }));
});

document.addEventListener('walletflow:export-dashboard', async event => {
    const { format, values, button } = event.detail;
    const endpoint = button.closest('form')?.dataset.exportEndpoint;
    if (!endpoint || !['xlsx', 'pdf'].includes(format)) {
        window.WalletFlowUI.showToast('Não foi possível iniciar a exportação.');
        return;
    }

    button.disabled = true;
    try {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('format', format);
        Object.entries(values).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value);
        });

        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'export_failed');
        }

        const file = await response.blob();
        const downloadUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `walletflow-dashboard.${format}`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        window.WalletFlowUI.showToast('Arquivo exportado com sucesso.');
    } catch (error) {
        console.error('Falha ao exportar dados:', error);
        window.WalletFlowUI.showToast('Falha ao exportar. Verifique sua sessão e tente novamente.');
    } finally {
        button.disabled = false;
    }
});
