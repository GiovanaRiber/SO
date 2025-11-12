// --- [ 1. CONFIGURAÇÃO INICIAL ] ---
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos do DOM
    const inputBusca = document.getElementById('busca-pet');
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const form = document.getElementById('form-vacina');
    
    // Cache para guardar os pets
    let petsCache = [];

    // --- [ 2. (NOVO) CARREGAR PETS NO DROPDOWN ] ---
    // Esta função faltava. Ela busca os pets e preenche o <select>
    async function carregarPets() {
        try {
            const res = await fetch('http://localhost:3000/pets'); // (Assumindo que este é o endpoint)
            petsCache = res.ok ? await res.json() : [];
            
            const petSelect = document.getElementById('pet-select-vacina');
            petSelect.innerHTML = '<option value="" disabled selected>Selecione um pet...</option>';
            petsCache.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                // (Assumindo que o seu back-end de pets retorna 'nome' e 'dono')
                opt.textContent = `${p.nome} - (Dono: ${p.dono})`; 
                petSelect.appendChild(opt);
            });
        } catch (err) {
            console.warn('Erro ao carregar pets no formulário:', err);
        }
    }

    // --- [ 3. FUNCIONALIDADE: FILTRO DA TABELA ] ---
    // (Esta função sua estava perfeita)
    inputBusca.addEventListener('keyup', () => {
        const termoBusca = inputBusca.value.toLowerCase();
        const linhasTabela = tabelaCorpo.getElementsByTagName('tr');

        for (let i = 0; i < linhasTabela.length; i++) {
            const linha = linhasTabela[i];
            const nomePet = linha.getElementsByTagName('td')[0].textContent.toLowerCase();
            if (nomePet.includes(termoBusca)) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        }
    });

    // --- [ 4. FUNCIONALIDADE: CARREGAR VACINAS NA TABELA ] ---
    // (Esta função sua estava ótima, só precisa de ser chamada)
    async function carregarVacinas() {
        try {
            const res = await fetch('http://localhost:3000/vacinas');
            const list = res.ok ? await res.json() : [];
            tabelaCorpo.innerHTML = '';
            
            list.forEach(v => {
                const row = tabelaCorpo.insertRow();
                
                // CORREÇÃO DE TIMEZONE: Adiciona timeZone: 'UTC' para 
                // evitar que a data mude (ex: dia 5 virar dia 4)
                const dataAplicacao = new Date(v.dataAplicacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                const proximaDose = v.proximaDose 
                    ? new Date(v.proximaDose).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) 
                    : '-';

                row.innerHTML = `
                    <td>${v.petNome}</td>
                    <td>${v.nomeVacina}</td>
                    <td>${dataAplicacao}</td>
                    <td>${proximaDose}</td>
                    <td><button class="botao-tabela botao-excluir" data-id="${v.id}">Excluir</button></td>
                `;
            });

            // Adiciona listeners nos botões de excluir
            // (Esta lógica sua estava perfeita)
            Array.from(document.getElementsByClassName('botao-excluir')).forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.dataset.id;
                    if (!confirm('Deseja excluir este registro de vacina?')) return;
                    try {
                        const del = await fetch(`http://localhost:3000/vacinas/${id}`, { method: 'DELETE' });
                        if (!del.ok) throw new Error('Falha ao excluir');
                        await carregarVacinas();
                    } catch (err) {
                        console.error(err);
                        alert('Erro ao excluir. Veja o console para mais detalhes.');
                    }
                });
            });
        } catch (err) {
            console.error('Erro ao carregar vacinas:', err);
        }
    }

    // --- [ 5. FUNCIONALIDADE: ENVIO DO FORMULÁRIO (CORRIGIDO) ] ---
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault(); 
        const dadosDoForm = new FormData(form);
        const dados = Object.fromEntries(dadosDoForm.entries());

        // --- AQUI ESTÁ A CORREÇÃO ---
        // O código antigo estava a enviar 'petNome: dados.nome_pet'
        // 'nome_pet' não existe mais no formulário, agora é 'pet_id'.
        
        // Validação
        if (!dados.pet_id) {
            alert('Por favor, selecione um pet antes de salvar.');
            return;
        }

        const payload = {
            // O back-end pode querer o ID do pet (petId)
            petId: parseInt(dados.pet_id), 
            
            // Ou, se o back-end realmente quiser o NOME, podemos buscar no cache
            // petNome: petsCache.find(p => p.id == dados.pet_id)?.nome, 
            
            // Vamos assumir que ele quer o ID, como na agenda:
            nomeVacina: dados.nome_vacina,
            dataAplicacao: dados.data_aplicacao,
            proximaDose: dados.proxima_dose || null
        };
        
        // (O resto da sua lógica de submit estava perfeita)
        try {
            const res = await fetch('http://localhost:3000/vacinas', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Erro: ${res.status} ${text}`);
            }
            await carregarVacinas(); // Recarrega a tabela
            form.reset();
            alert('Registro salvo com sucesso.');
            inputBusca.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error(err);
            alert('Falha ao salvar. Veja o console para detalhes.');
        }
    });

    // --- [ 6. INICIALIZAÇÃO ] ---
    carregarPets(); // Carrega o dropdown
    carregarVacinas(); // Carrega a tabela

});