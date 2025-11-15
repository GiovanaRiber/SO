import React, { useState, useEffect, useMemo } from 'react';

// 1. URL DA API (o seu back-end Docker/PostgreSQL)
const API_URL = 'http://localhost:8080';

function PaginaClientes() {
  
  // 2. ESTADOS (A "Memória" do Componente)
  const [pets, setPets] = useState([]); // Guarda a lista de pets vinda do banco
  const [termoBusca, setTermoBusca] = useState(''); // Guarda o texto da barra de busca
  const [isLoading, setIsLoading] = useState(true); // Controla a mensagem "Carregando..."
  
  // Estado para controlar o formulário (Inputs Controlados)
  const [formState, setFormState] = useState({
    nomeDono: '',
    telefone: '',
    email: '',
    nomePet: '',
    racaPet: '',
    idadePet: ''
  });

  
  // 3. EFEITO (Busca os dados do banco quando a página carrega)
  useEffect(() => {
    const fetchPets = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/pets`); 
        if (!res.ok) throw new Error('Falha ao carregar pets');
        const data = await res.json();
        setPets(data); // Guarda a lista real no estado
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar pets. O seu back-end (Docker) está rodando?');
      } finally {
        setIsLoading(false); // Termina o carregamento
      }
    };
    fetchPets();
  }, []); // O '[]' vazio significa "Rode isto UMA VEZ quando a página carregar"

  
  // 4. HANDLER DO FORMULÁRIO (Controla os inputs)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Atualiza o estado do formulário
    setFormState(dadosAntigos => ({
      ...dadosAntigos,
      [name]: value
    }));
  };
  
  // 5. HANDLER DE SUBMISSÃO (Salva no banco)
  const handleSubmit = async (evento) => {
    evento.preventDefault(); 

    if (formState.nomeDono.length < 3) {
      alert("O nome do dono deve ter pelo menos 3 letras!");
      return; 
    }
    
    // Payload que o back-end espera (baseado no seu 'index.js')
    const payload = {
      nome: formState.nomePet,
      raca: formState.racaPet || 'SRD',
      dono: formState.nomeDono,
      // NOTA: O seu index.js/Prisma não salva telefone/email/idade,
      // então só enviamos o que ele aceita.
    };

    try {
      const res = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Erro no POST: ${res.status}`);
      
      const novoPet = await res.json();
      
      // Magia do React: Atualiza a lista na tela
      setPets(listaAntiga => [...listaAntiga, novoPet]); 
      
      alert('Salvo com sucesso!');
      
      // Limpa o formulário
      setFormState({
        nomeDono: '', telefone: '', email: '',
        nomePet: '', racaPet: '', idadePet: ''
      });

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar. Verifique o console.');
    }
  };

  // 6. HANDLER DE DELETE (Apaga do banco)
  const handleDelete = async (idDoPet) => {
    if (confirm("Tem certeza que deseja excluir este pet?")) {
      try {
        const res = await fetch(`${API_URL}/pets/${idDoPet}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert("Pet removido!");
          // Magia do React: Remove o pet da lista na tela
          setPets(pets.filter(pet => pet.id !== idDoPet));
        } else {
          alert("Erro ao deletar.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  // 7. LÓGICA DE FILTRO E AGRUPAMENTO (O "Estado Derivado")
  const listaDonosFiltrada = useMemo(() => {
    // Agrupa pets por dono (lógica do seu 'clientes.js' antigo)
    const donosAgrupados = pets.reduce((acc, pet) => {
      if (!acc[pet.dono]) {
        acc[pet.dono] = {
          nome: pet.dono,
          contato: "Contato não registrado", // O seu GET /pets não tem esta info
          pets: []
        };
      }
      acc[pet.dono].pets.push(pet);
      return acc;
    }, {});
    
    // Converte o objeto de volta para um array
    const listaDeDonos = Object.values(donosAgrupados);
    
    // Aplica o filtro da busca (lógica do seu 'keyup' antigo)
    if (!termoBusca) {
      return listaDeDonos; // Retorna tudo se a busca estiver vazia
    }
    
    return listaDeDonos.filter(dono => {
      const textoDono = dono.nome.toLowerCase();
      const textoPets = dono.pets.map(p => `${p.nome} ${p.raca || ''}`).join(' ').toLowerCase();
      return (textoDono + textoPets).includes(termoBusca.toLowerCase());
    });
    
  }, [pets, termoBusca]); // Recalcula se 'pets' ou 'termoBusca' mudar
  

  // 8. O JSX (O seu "HTML" com dados reais)
  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">

        <div className="agenda-header">
          <h2>Gestão de Clientes e Pets</h2>
        </div>

        <div className="clientes-grid">

          {/* ===== [COLUNA 1: FORMULÁRIO "CONTROLADO"] ===== */}
          <div id="novo-cliente" className="form-coluna">
            <div className="dash-card">
              <h3>Adicionar Novo Cliente</h3>
              <form id="form-cliente" className="formulario-cliente" onSubmit={handleSubmit}>
                
                {/* --- [Grupo Dono] --- */}
                <div className="form-grupo">
                  <label htmlFor="nome-dono">Nome do Dono:</label>
                  <input type="text" id="nome-dono" name="nomeDono" required 
                         value={formState.nomeDono} onChange={handleFormChange} />
                </div>
                <div className="form-grupo">
                  <label htmlFor="telefone-dono">Telefone:</label>
                  <input type="tel" id="telefone-dono" name="telefone" placeholder="(XX) XXXXX-XXXX"
                         value={formState.telefone} onChange={handleFormChange} />
                </div>
                <div className="form-grupo">
                  <label htmlFor="email-dono">Email (Opcional):</label>
                  <input type="email" id="email-dono" name="email"
                         value={formState.email} onChange={handleFormChange} />
                </div>
                
                <hr className="form-divisor" />
                
                {/* --- [Grupo Pet] --- */}
                <h4>Adicionar Pet</h4>
                <div className="form-grupo">
                  <label htmlFor="nome-pet-form">Nome do Pet:</label>
                  <input type="text" id="nome-pet-form" name="nomePet" required
                         value={formState.nomePet} onChange={handleFormChange} />
                </div>
                <div className="form-grupo-grid2">
                  <div className="form-grupo">
                    <label htmlFor="raca-pet">Raça:</label>
                    <input type="text" id="raca-pet" name="racaPet" placeholder="Ex: Golden"
                           value={formState.racaPet} onChange={handleFormChange} />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="idade-pet">Idade (anos):</label>
                    <input type="number" id="idade-pet" name="idadePet" min="0"
                           value={formState.idadePet} onChange={handleFormChange} />
                  </div>
                </div>
                
                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>
                  Salvar Cliente e Pet
                </button>
              </form>
            </div>
          </div>

          {/* ===== [COLUNA 2: LISTA "DINÂMICA"] ===== */}
          <div className="lista-coluna">
            {/* O input de busca "controlado" */}
            <input 
              type="text" 
              id="busca-cliente" 
              className="filtro-cliente" 
              placeholder="Buscar cliente por nome ou pet..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            
            <div id="lista-clientes-container" className="lista-clientes-scroll">
              
              {/* === ESTA É A MUDANÇA ===
                  Apagámos os cards "Ana Silva" e "Bruno Costa" 
                  e substituímos por esta lógica: */}

              {isLoading && <p>Carregando clientes...</p>}
              
              {!isLoading && listaDonosFiltrada.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem' }}>
                  {termoBusca ? 'Nenhum resultado encontrado.' : 'Nenhum cliente cadastrado.'}
                </p>
              )}

              {/* O "Loop" do React (.map) que desenha os cards REAIS */}
              {!isLoading && listaDonosFiltrada.map(dono => (
                <div className="cliente-card" key={dono.nome}>
                  <div className="cliente-info">
                    <h4>{dono.nome}</h4>
                    <p><small>{dono.contato}</small></p>
                  </div>
                  <div className="cliente-pets" style={{ flexGrow: 1, textAlign: 'right' }}>
                    {dono.pets.map(pet => (
                      <div className="pet-tag" key={pet.id} style={{ display: 'inline-block', margin: '2px', padding: '5px', background: '#eee', borderRadius: '5px' }}>
                        {pet.nome} <small>({pet.raca || 'SRD'})</small>
                        <span 
                          onClick={() => handleDelete(pet.id)} 
                          style={{ cursor: 'pointer', color: 'red', marginLeft: '5px', fontWeight: 'bold' }}
                        >
                          &times;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
            </div>
          </div>

        </div> {/* Fim do .clientes-grid */}
      </div> {/* Fim do .conteiner */}
    </div> /* Fim do .agenda-secao */
  );
}

export default PaginaClientes;