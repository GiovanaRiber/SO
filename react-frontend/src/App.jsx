import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Navbar from './components/Navbar.jsx';
import Rodape from './components/Rodape.jsx'; // 1. Importe o Rodapé

function App() {
  return (
    <div>
      <Navbar />
      
      {/* A main agora não tem classes, 
          pois o conteúdo de cada página (o Outlet)
          vai trazer as suas próprias classes ("hero", "conteiner", etc.) */}
      <main>
        <Outlet /> 
      </main>

      <Rodape /> {/* 2. Adicione o Rodapé aqui */}
    </div>
  );
}

export default App;