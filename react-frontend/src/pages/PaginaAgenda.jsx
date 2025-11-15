import React, { useState, useEffect, useMemo } from 'react';
// Importe a sua imagem da pasta /src/assets/
import imgAgendamento from '../assets/agendamento.png'; 

// 1. CONSTANTES (do seu JS antigo)
const API_URL = 'http://localhost:8080';
const nomeDosMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
// Horários "slots" (do seu JS antigo)
const horariosSimulados = [];
for (let h = 9; h <= 17; h++) {
  horariosSimulados.push(`${String(h).padStart(2, '0')}:00`);
  horariosSimulados.push(`${String(h).padStart(2, '0')}:30`);
}
horariosSimulados.push('18:00');

function PaginaAgenda() {
  // --- [ 2. ESTADOS (A "Memória" do React) ] ---
  
  // 'dataAtual' do seu JS antigo, agora é um estado
  const [dataAtual, setDataAtual] = useState(new Date()); 
  
  // 'petsCache' e 'servicosCache' do seu JS antigo
  const [petsCache, setPetsCache] = useState([]);
  const [servicosCache, setServicosCache] = useState([]);
  
  // Onde vamos guardar os agendamentos vindos do back-end
  const [agendamentos, setAgendamentos] = useState([]);
  
  // Estado para saber qual dia foi clicado
  const [diaSelecionado, setDiaSelecionado] = useState(new Date()); // Começa com 'hoje'
  
  // Estado para controlar o formulário (Inputs Controlados)
  const [formData, setFormData] = useState({
    petId: '',
    servicoNome: '', // O seu JS antigo usava o nome
    data: '',
    hora: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // --- [ 3. EFEITOS (O "carregarPetsEServicos" e "atualizarHorarios" do seu JS antigo) ] ---
  
  // Este useEffect roda UMA VEZ quando a página carrega (igual ao DOMContentLoaded)
  useEffect(() => {
    const carregarTudo = async () => {
      setIsLoading(true);
      try {
        // Busca pets, serviços e TODOS os agendamentos de uma vez
        const [petsRes, servicosRes, agendamentosRes] = await Promise.all([
          fetch(`${API_URL}/pets`),
          fetch(`${API_URL}/servicos`),
          fetch(`${API_URL}/agendamentos`)
        ]);

        const petsData = petsRes.ok ? await petsRes.json() : [];
        const servicosData = servicosRes.ok ? await servicosRes.json() : [];
        const agendamentosData = agendamentosRes.ok ? await agendamentosRes.json() : [];

        // Guarda os dados no "Estado" (o "cache" do React)
        setPetsCache(petsData);
        setServicosCache(servicosData);
        setAgendamentos(agendamentosData);
        
      } catch (err) {
        console.warn('Erro ao carregar dados iniciais:', err);
        alert('Erro ao carregar dados. Verifique a conexão com o back-end.');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTudo();
  }, []); // '[]' = Roda 1 vez

  // --- [ 4. LÓGICA DE RENDERIZAÇÃO (Funções Auxiliares) ] ---
  
  // Lógica de "agendamentos ocupados" (do seu JS antigo)
  // useMemo "memoriza" o cálculo. Só recalcula se 'agendamentos' ou 'diaSelecionado' mudar.
  const agendamentosDoDia = useMemo(() => {
    if (!diaSelecionado) return [];
    
    // Converte a data para o formato 'YYYY-MM-DD'
    const dataISO = diaSelecionado.toISOString().split('T')[0];
    
    // Filtra os agendamentos (igual ao seu JS antigo)
    return agendamentos.filter(a => a.dataHora.startsWith(dataISO));
  }, [agendamentos, diaSelecionado]); // Dependências


  // Gera os dias do calendário (o seu 'renderizarCalendario')
  const gerarDiasDoCalendario = () => {
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    
    const dias = [];

    // Dias do mês anterior (cinzentos)
    for (let i = primeiroDiaDoMes; i > 0; i--) {
      dias.push(
        <div className="dia-calendario outro-mes" key={`prev-${i}`}>
          {ultimoDiaMesAnterior - i + 1}
        </div>
      );
    }

    // Dias do mês atual
    for (let i = 1; i <= ultimoDiaDoMes; i++) {
      const dataCompleta = new Date(ano, mes, i);
      
      let classes = 'dia-calendario';
      if (dataCompleta.getTime() === hoje.getTime()) classes += ' hoje';
      if (diaSelecionado && dataCompleta.getTime() === diaSelecionado.getTime()) classes += ' selecionado';

      dias.push(
        <div className={classes} key={`curr-${i}`} onClick={() => handleDiaClick(dataCompleta)}>
          {i}
        </div>
      );
    }
    return dias;
  };
  
  // --- [ 5. FUNÇÕES DE EVENTO (Handlers) ] ---

  const mudarMes = (offset) => {
    // 'offset' é -1 (anterior) ou +1 (próximo)
    const novaData = new Date(dataAtual.setMonth(dataAtual.getMonth() + offset));
    setDataAtual(novaData);
  };
  
  const handleDiaClick = (data) => {
    setDiaSelecionado(data);
  };

  // O seu 'preencherFormulario'
  const handleHorarioVagoClick = (hora) => {
    const dataISO = diaSelecionado.toISOString().split('T')[0];
    
    // Atualiza o estado do formulário
    setFormData({ 
      ...formData, // Mantém o pet/serviço se já estiverem selecionados
      data: dataISO, 
      hora: hora 
    });
    
    // Rola a página até o formulário
    document.getElementById('novo-agendamento').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  // Handler para "controlar" o formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(dadosAntigos => ({
      ...dadosAntigos,
      [name]: value 
    }));
  };

  // O seu 'form.addEventListener('submit')'
  const handleSubmit = async (evento) => {
    evento.preventDefault();
    
    // Validações (do seu JS antigo)
    if (!formData.data || !formData.hora) {
      alert('Data ou hora inválida. Selecione um horário vago na lista antes de confirmar.');
      return;
    }
    if (!formData.petId) {
      alert('Selecione um pet antes de confirmar.');
      return;
    }
    if (!formData.servicoNome) {
      alert('Selecione um serviço antes de confirmar.');
      return;
    }

    try {
      let servicoObj = servicosCache.find(s => s.nome === formData.servicoNome);

      // A sua lógica de "criar serviço se não existe" (Preservada 100%!)
      if (!servicoObj) {
        console.warn(`Serviço "${formData.servicoNome}" não encontrado, criando...`);
        const createRes = await fetch(`${API_URL}/servicos`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: formData.servicoNome, preco: 0 }) // Preço 0 como no seu JS
        });
        if (!createRes.ok) throw new Error('Falha ao criar novo serviço');
        
        servicoObj = await createRes.json();
        // Atualiza o "cache" (estado)
        setServicosCache(cacheAntigo => [...cacheAntigo, servicoObj]); 
      }

      // Monta o payload (igual ao seu JS antigo)
      const dataHora = new Date(`${formData.data}T${formData.hora}`);
      const payload = {
        dataHora: dataHora.toISOString(),
        petId: parseInt(formData.petId),
        servicoId: parseInt(servicoObj.id)
      };

      // Envia para o back-end
      const res = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao criar agendamento');
      }
      
      const novoAgendamento = await res.json();
      
      // Magia do React: Atualiza o estado em vez de recarregar
      setAgendamentos(agendamentosAntigos => [...agendamentosAntigos, novoAgendamento]);
      
      alert('Agendamento criado com sucesso.');
      // Limpa o formulário
      setFormData({ petId: '', servicoNome: '', data: '', hora: '' });

    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      alert(`Erro ao criar agendamento: ${err.message}`);
    }
  };


  // --- [ 6. O JSX (O seu "HTML" Renderizado) ] ---
  
  if (isLoading) {
    return <div className="conteiner"><p>Carregando agenda...</p></div>
  }

  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">
        
        {/* ----- [CABEÇALHO] ----- */}
        <div className="agenda-header">
          <h2>Agenda de Banho e Tosa</h2>
          <a href="#novo-agendamento" className="botao-principal">Novo Agendamento</a>
        </div>

        {/* ----- [GRID DO CALENDÁRIO] ----- */}
        <div className="agenda-grid">
          
          {/* Coluna 1: O Calendário (Agora dinâmico) */}
          <div className="calendario-container">
            <div className="calendario-header">
              <button className="nav-mes" id="mes-anterior" onClick={() => mudarMes(-1)}>&larr;</button>
              <h3 id="mes-ano-atual">{`${nomeDosMeses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`}</h3>
              <button className="nav-mes" id="proximo-mes" onClick={() => mudarMes(1)}>&rarr;</button>
            </div>
            <div className="calendario-dias">
              <div className="dia-semana">Dom</div>
              <div className="dia-semana">Seg</div>
              <div className="dia-semana">Ter</div>
              <div className="dia-semana">Qua</div>
              <div className="dia-semana">Qui</div>
              <div className="dia-semana">Sex</div>
              <div className="dia-semana">Sáb</div>
              {/* O React vai "desenhar" os dias aqui */}
              {gerarDiasDoCalendario()}
            </div>
          </div>
          
          {/* Coluna 2: A Lista de Horários (Agora dinâmica) */}
          <div className="lista-agendamentos">
            <h3 id="horarios-titulo">
              {diaSelecionado 
                ? `Horários para ${diaSelecionado.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}` 
                : 'Selecione um dia'}
            </h3>
            <ul id="horarios-lista" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {!diaSelecionado && <li style={{ opacity: 0.7 }}>Nenhum dia selecionado.</li>}
              
              {/* O "Loop" do React (.map) que desenha os horários */}
              {diaSelecionado && horariosSimulados.map(hora => {
                // Verifica se o slot está ocupado (lógica do seu 'atualizarHorarios')
                const agendamentoOcupado = agendamentosDoDia.find(a => 
                  a.dataHora.includes(`T${hora}`)
                );

                if (agendamentoOcupado) {
                  // Tenta encontrar os nomes no "cache" (estado)
                  const pet = petsCache.find(p => p.id === agendamentoOcupado.petId);
                  const servico = servicosCache.find(s => s.id === agendamentoOcupado.servicoId);
                  
                  return (
                    <div className="agendamento-item ocupado" key={hora}>
                      <span className="hora">{hora}</span>
                      <span className="nome-pet">{pet ? pet.nome : '...'}</span>
                      <span className="servico">{servico ? servico.nome : '...'}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="agendamento-item vago" key={hora} onClick={() => handleHorarioVagoClick(hora)}>
                      <span className="hora">{hora}</span>
                      <span className="nome-pet">Horário Vago</span>
                    </div>
                  );
                }
              })}
            </ul>
          </div>
        </div>

        {/* ----- [SECÇÃO DO FORMULÁRIO] (Agora "Controlado") ----- */}
        <section id="novo-agendamento" className="sobre-nos-secao" style={{ marginTop: '3rem', background: 'var(--cor-branca)' }}>
          <div className="sobre-nos-grid">
            
            <div className="sobre-nos-texto">
              <h2>Agendar um Horário</h2>
              <p>Selecione um horário vago na lista para preencher os detalhes.</p>
              
              <form id="form-agendamento" className="formulario-agenda" onSubmit={handleSubmit}>
                
                <div className="form-grupo">
                  <label htmlFor="pet-select-agenda">Pet:</label>
                  {/* O 'select' de Pets, agora dinâmico */}
                  <select id="pet-select-agenda" name="petId" required 
                          value={formData.petId} onChange={handleFormChange}>
                    <option value="" disabled>Selecione um pet...</option>
                    {petsCache.map(pet => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} - (Dono: {pet.dono})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label htmlFor="servico">Serviço:</label>
                  {/* O 'select' de Serviços, agora dinâmico */}
                  <select id="servico" name="servicoNome" required
                          value={formData.servicoNome} onChange={handleFormChange}>
                    <option value="" disabled>Selecione...</option>
                    {servicosCache.map(s => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label htmlFor="data">Data:</label>
                  <input type="date" id="data" name="data" required readOnly 
                         value={formData.data} />
                </div>
                <div className="form-grupo">
                  <label htmlFor="hora">Hora:</label>
                  <input type="time" id="hora" name="hora" required readOnly 
                         value={formData.hora} />
                </div>
                
                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer' }}>Confirmar Agendamento</button>
              </form>
            </div>
            
            <div className="sobre-nos-imagem">
              <img src={imgAgendamento} alt="Calendário e pet" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PaginaAgenda;