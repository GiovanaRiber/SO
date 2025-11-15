import React, { useState, useEffect, useMemo } from 'react';
// Importe a sua imagem da pasta /src/assets/
import imgVacina from '../assets/img-vacina-para-caes.png';

// 1. URL DA API (o seu back-end Docker)
const API_URL = 'http://localhost:8080';

// Função auxiliar para formatar a data (do seu JS antigo)
const formatarData = (dataString) => {
  if (!dataString) return '-';
  return new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

function PaginaVacinas() {
  
  // 2. ESTADOS (A "Memória" do Componente)
  // Guarda a lista de pets (do 'petsCache')
  const [pets, setPets] = useState([]);
  // Guarda a lista de vacinas (da 'tabelaCorpo')
  const [vacinas, setVacinas] = useState([]);
  // Guarda o termo da barra de busca
  const [termoBusca, setTermoBusca] = useState('');
  // Guarda o estado do formulário (Inputs Controlados)
  const [formData, setFormData] = useState({
    petId: '',
    nomeVacina: '',
    dataAplicacao: '',
    proximaDose: ''
  });
  // Guarda o estado de "carregamento"
  const [isLoading, setIsLoading] = useState(true);

  // 3. EFEITO (O antigo "DOMContentLoaded" -> "carregarPets" e "carregarVacinas")
  useEffect(() => {
    const carregarTudo = async () => {
      setIsLoading(true);
      try {
        // Busca pets E vacinas de uma vez (mais eficiente)
        const [petsRes, vacinasRes] = await Promise.all([
          fetch(`${API_URL}/pets`, { cache: 'no-cache' }), // Usando a sua lógica de 'no-cache'
          fetch(`${API_URL}/vacinas`, { cache: 'no-cache' })
        ]);

        const petsData = petsRes.ok ? await petsRes.json() : [];
        const vacinasData = vacinasRes.ok ? await vacinasRes.json() : [];
        
        setPets(petsData);
        setVacinas(vacinasData);

      } catch (err) {
        console.warn('Erro ao carregar dados:', err);
        alert('Erro ao carregar dados. Verifique a conexão com o back-end.');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarTudo();
  }, []); // O array '[]' vazio significa "Rode isto UMA VEZ quando a página carregar"

  
  // 4. LÓGICA DE SUBMISSÃO (O antigo "form.addEventListener")
  const handleSubmit = async (evento) => {
    evento.preventDefault(); 
    
    // Validação (igual à antiga)
    if (!formData.petId) {
      alert('Por favor, selecione um pet antes de salvar.');
      return;
    }

    // Payload (igual ao seu JS antigo, que já estava correto)
    const payload = {
      petId: parseInt(formData.petId), 
      nomeVacina: formData.nomeVacina,
      dataAplicacao: formData.dataAplicacao,
      proximaDose: formData.proximaDose || null
    };
    
    try {
      const res = await fetch(`${API_URL}/vacinas`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro: ${res.status} ${text}`);
      }

      // A "Magia" do React:
      // Em vez de 'carregarVacinas()', nós ATUALIZAMOS o estado
      // O back-end (index.js) não retorna o 'petNome' no POST,
      // então buscamos o nome no 'pets' (cache) para a tabela atualizar
      const petSalvo = pets.find(p => p.id === payload.petId);
      const novoRegistro = await res.json();
      
      // Adiciona o 'petNome' manualmente para a tabela renderizar
      novoRegistro.petNome = petSalvo ? petSalvo.nome : 'Pet Desconhecido'; 
      
      setVacinas(listaAntiga => [...listaAntiga, novoRegistro]);
      
      alert('Registro salvo com sucesso.');
      setFormData({ petId: '', nomeVacina: '', dataAplicacao: '', proximaDose: '' }); // Limpa o form

    } catch (err) {
      console.error(err);
      alert('Falha ao salvar. Veja o console para detalhes.');
    }
  };

  // 5. LÓGICA DE DELETE (O antigo "botao-excluir.addEventListener")
  const handleDelete = async (idDaVacina) => {
    if (!confirm('Deseja excluir este registro de vacina?')) return;

    try {
      const res = await fetch(`${API_URL}/vacinas/${idDaVacina}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      
      // Magia do React:
      // Em vez de 'carregarVacinas()', atualizamos o estado
      setVacinas(listaAntiga => listaAntiga.filter(v => v.id !== idDaVacina));
      alert('Registro excluído.');

    } catch (err) {
      console.error(err);
      alert('Erro ao excluir. Veja o console.');
    }
  };
  
  // 6. LÓGICA DE FILTRO (O antigo "inputBusca.addEventListener")
  // useMemo "memoriza" o filtro. Só é refeito se 'vacinas' ou 'termoBusca' mudar.
  const vacinasFiltradas = useMemo(() => {
    return vacinas.filter(vacina => 
      vacina.petNome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [vacinas, termoBusca]); // Dependências


  // 7. O JSX (O seu "HTML" Renderizado)
  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">

        {/* ----- [CABEÇALHO] ----- */}
        <div className="agenda-header">
          <h2>Controle de Vacinas</h2>
          <a href="#novo-registro" className="botao-principal">Adicionar Registro</a>
        </div>

        {/* ----- [FILTRO "CONTROLADO"] ----- */}
        <div className="filtro-container">
          <input 
            type="text" 
            id="busca-pet" 
            placeholder="Buscar por nome do pet..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        {/* ----- [TABELA "DINÂMICA"] ----- */}
        <div className="tabela-container">
          <table className="tabela-vacinas">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Vacina</th>
                <th>Data Aplicação</th>
                <th>Próxima Dose</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tabela-corpo">
              
              {/* Renderização Condicional */}
              {isLoading && (
                <tr><td colSpan="5">Carregando registros...</td></tr>
              )}
              
              {!isLoading && vacinasFiltradas.length === 0 && (
                <tr><td colSpan="5">
                  {termoBusca ? 'Nenhum resultado encontrado.' : 'Nenhum registro de vacina.'}
                </td></tr>
              )}
              
              {/* O "Loop" do React (.map) que desenha as linhas */}
              {!isLoading && vacinasFiltradas.map(vacina => (
                <tr key={vacina.id}>
                  <td>{vacina.petNome}</td>
                  <td>{vacina.nomeVacina}</td>
                  <td>{formatarData(vacina.dataAplicacao)}</td>
                  <td>{formatarData(vacina.proximaDose)}</td>
                  <td>
                    {/* O 'onClick' chama a nossa função interna */}
                    <button 
                      className="botao-tabela botao-excluir" 
                      onClick={() => handleDelete(vacina.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ----- [SECÇÃO DO FORMULÁRIO "CONTROLADO"] ----- */}
        <section id="novo-registro" className="sobre-nos-secao" style={{ marginTop: '3rem', background: 'var(--cor-laranja-claro)' }}>
          <div className="sobre-nos-grid">
            
            <div className="sobre-nos-imagem">
              <img src={imgVacina} alt="Vacinação de pet" />
            </div>

            <div className="sobre-nos-texto">
              <h2>Adicionar Novo Registro</h2>
              
              <form id="form-vacina" className="formulario-agenda" onSubmit={handleSubmit}>
                
                <div className="form-grupo">
                  <label htmlFor="pet-select-vacina">Pet:</label>
                  {/* O 'select' de Pets, agora dinâmico */}
                  <select 
                    id="pet-select-vacina" 
                    name="petId" 
                    required
                    value={formData.petId}
                    onChange={(e) => setFormData({...formData, petId: e.target.value})}
                  >
                    <option value="" disabled>Selecione um pet...</option>
                    {/* O "Loop" do React que desenha as options */}
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} - (Dono: {pet.dono})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Inputs "Controlados" */}
                <div className="form-grupo">
                  <label htmlFor="nome-vacina">Nome da Vacina:</label>
                  <input 
                    type="text" id="nome-vacina" name="nomeVacina" required
                    value={formData.nomeVacina}
                    onChange={(e) => setFormData({...formData, nomeVacina: e.target.value})}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="data-aplicacao">Data da Aplicação:</label>
                  <input 
                    type="date" id="data-aplicacao" name="dataAplicacao" required
                    value={formData.dataAplicacao}
                    onChange={(e) => setFormData({...formData, dataAplicacao: e.target.value})}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="proxima-dose">Próxima Dose (Opcional):</label>
                  <input 
                    type="date" id="proxima-dose" name="proximaDose"
                    value={formData.proximaDose}
                    onChange={(e) => setFormData({...formData, proximaDose: e.target.value})}
                  />
                </div>
                
                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', background: 'var(--cor-laranja)' }}>Salvar Registro</button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default PaginaVacinas;