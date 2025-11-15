import React, { useState, useEffect, useMemo } from 'react'; 
import { Link } from 'react-router-dom';
import dogosBackground from '../assets/dogos.jpg'; 

// 2. URL DA API
const API_URL = 'http://localhost:8080';

// Função auxiliar para formatar a data (para "Próximos Horários")
const formatarHora = (dataString) => {
  return new Date(dataString).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
};

function PaginaPainel() {

  // 3. ESTADOS (A "Memória" da Página)
  const [pets, setPets] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. EFEITO (O "Fetch" de Dados)
  // Roda uma vez quando a página carrega
  useEffect(() => {
    const carregarTudo = async () => {
      setIsLoading(true);
      try {
        // Busca todos os dados de uma vez
        const [petsRes, agendamentosRes, vacinasRes] = await Promise.all([
          fetch(`${API_URL}/pets`),
          fetch(`${API_URL}/agendamentos`),
          fetch(`${API_URL}/vacinas`)
        ]);

        const petsData = petsRes.ok ? await petsRes.json() : [];
        const agendamentosData = agendamentosRes.ok ? await agendamentosRes.json() : [];
        const vacinasData = vacinasRes.ok ? await vacinasRes.json() : [];

        setPets(petsData);
        setAgendamentos(agendamentosData);
        setVacinas(vacinasData);

      } catch (err) {
        console.warn('Erro ao carregar dados do dashboard:', err);
        alert('Erro ao carregar o painel. O seu back-end (Docker) está rodando?');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTudo();
  }, []); // [] = Roda 1 vez

  // 5. CÁLCULOS (O "Cérebro" do Dashboard)
  // 'useMemo' recalcula os resumos (de forma eficiente) sempre que os dados mudam.
  const estatisticas = useMemo(() => {
    // --- Data de "Hoje" (em UTC para comparar com o banco) ---
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0); // Zera a hora para UTC
    const hojeISO = hoje.toISOString().split('T')[0];
    
    // Data de "Daqui a 7 dias"
    const semanaQueVem = new Date(hoje);
    semanaQueVem.setUTCDate(hoje.getUTCDate() + 7);

    // --- Card 1: Agendamentos de Hoje ---
    const agendamentosDeHoje = agendamentos.filter(a => 
      a.dataHora.startsWith(hojeISO)
    );

    // --- Card 2: Vacinas a Vencer ---
    const vacinasAVencer = vacinas.filter(v => {
      if (!v.proximaDose) return false;
      const dataDose = new Date(v.proximaDose);
      return dataDose >= hoje && dataDose <= semanaQueVem;
    });
    
    // --- Card 3: Total de Clientes ---
    // (Usa a mesma lógica do seu 'clientes.js' para agrupar)
    const donos = new Set(pets.map(p => p.dono));
    const totalClientes = donos.size;
    const totalPets = pets.length;

    // --- Card 4: Próximos Horários ---
    // Pega os de hoje, ordena e pega os 3 primeiros
    const proximosHorarios = [...agendamentosDeHoje]
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .slice(0, 3); // Pega só os 3 primeiros

    return {
      agendamentosDeHoje,
      vacinasAVencer,
      totalClientes,
      totalPets,
      proximosHorarios
    };
  }, [pets, agendamentos, vacinas]); // Recalcula se estas listas mudarem

  
  // Objeto de estilo para o Hero (igual ao que já tínhamos)
  const heroStyle = {
    background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${dogosBackground}) center/cover no-repeat`,
    height: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'var(--cor-branca)',
    padding: '0 1rem',
  };

  // 6. O JSX (O seu "HTML" com dados reais)
  return (
    <>
      <main className="hero" style={heroStyle}>
        <div className="conteudo-hero">
          <h1>Bem-vindo, Gerente!</h1>
          <p style={{ margin: '1rem auto 2rem', maxWidth: '600px' }}>
            Acesse seus módulos de gestão ou veja um resumo do dia abaixo.
          </p>
          <Link to="/agenda" className="botao-principal">Ir para a Agenda</Link>
        </div>
      </main>

      <section className="dashboard-secao">
        <div className="conteiner">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>Resumo do Dia</h2>
          
          {/* Mostra "Carregando..." enquanto os dados não chegam */}
          {isLoading ? (
            <p style={{ textAlign: 'center' }}>Carregando estatísticas...</p>
          ) : (
            
            /* Quando os dados chegam, mostra o grid */
            <div className="dashboard-grid">

              <div className="dash-card">
                <h3>Agendamentos de Hoje</h3>
                {/* DADO REAL */}
                <div className="dash-numero">{estatisticas.agendamentosDeHoje.length}</div>
                <p>Agendamentos para hoje</p>
                <Link to="/agenda" className="botao-card" style={{ background: 'var(--cor-primaria)', color: 'var(--cor-branca)', border: 'none' }}>
                  Ver Agenda Completa
                </Link>
              </div>

              <div className="dash-card">
                <h3>Vacinas a Vencer</h3>
                {/* DADO REAL */}
                <div className="dash-numero">{estatisticas.vacinasAVencer.length}</div>
                <p>Próximos 7 dias</p>
                <Link to="/vacinas" className="botao-card" style={{ background: 'var(--cor-primaria)', color: 'var(--cor-branca)', border: 'none' }}>
                  Ver Controle de Vacinas
                </Link>
              </div>

              <div className="dash-card">
                <h3>Total de Clientes</h3>
                {/* DADO REAL */}
                <div className="dash-numero">{estatisticas.totalClientes}</div>
                {/* DADO REAL */}
                <p>{estatisticas.totalClientes} clientes e {estatisticas.totalPets} pets cadastrados.</p>
                <Link to="/clientes" className="botao-card" style={{ background: 'var(--cor-primaria)', color: 'var(--cor-branca)', border: 'none' }}>
                  Gerenciar Clientes
                </Link>
              </div>

              <div className="dash-card dash-card-grande">
                <h3>Próximos Horários</h3>
                <div className="dash-lista-resumo">
                  
                  {/* DADO REAL (Loop) */}
                  {estatisticas.proximosHorarios.length === 0 && (
                    <p style={{ opacity: 0.7, padding: '1rem' }}>Nenhum agendamento hoje.</p>
                  )}
                  
                  {estatisticas.proximosHorarios.map(agendamento => {
                    // Tenta encontrar o nome do Pet no "cache" (estado)
                    const pet = pets.find(p => p.id === agendamento.petId);
                    return (
                      <div className="agendamento-item" key={agendamento.id}>
                        <span className="hora">{formatarHora(agendamento.dataHora)}</span>
                        <span className="nome-pet">{pet ? pet.nome : 'Carregando...'}</span>
                        <span className="servico">{agendamento.servico.nome}</span> {/* O GET /agendamentos já inclui o serviço */}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default PaginaPainel;