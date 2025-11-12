// index.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// --- Inicialização ---
const prisma = new PrismaClient();
const app = express();
app.use(express.json()); // Habilita o Express para ler JSON
const PORT = 3000;

// CREATE pets
app.post('/pets', async (req, res) => {
  try {
    const { nome, raca, dono } = req.body;
    const pet = await prisma.pet.create({
      data: { nome, raca, dono },
    });
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ (Todos)
app.get('/pets', async (req, res) => {
  const pets = await prisma.pet.findMany();
  res.json(pets);
});

// UPDATE pets
// altera nome, raca ou dono
app.put('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, raca, dono } = req.body;
    const pet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome,
        raca: raca,
        dono: dono,
      },
    });
    res.json(pet);
  } catch (error) {
    res.status(404).json({ error: 'Pet não encontrado' });
  }
});

// DELETE pets
app.delete('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pet.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    res.status(404).json({ error: 'Pet não encontrado' });
  }
});


// CREATE SERVIÇOS 
app.post('/servicos', async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const servico = await prisma.servico.create({
      data: { nome, preco: parseFloat(preco) },
    });
    res.status(201).json(servico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ (Todos)
app.get('/servicos', async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
});

// UPDATE serviços
// altera nome ou preco
app.put('/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco } = req.body;
    const servico = await prisma.servico.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome,
        preco: preco ? parseFloat(preco) : undefined,
      },
    });
    res.json(servico);
  } catch (error) {
    res.status(404).json({ error: 'Serviço não encontrado' });
  }
});

// DELETE serviços
app.delete('/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.servico.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    res.status(404).json({ error: 'Serviço não encontrado' });
  }
});

// CREATE AGENDAMENTOS
app.post('/agendamentos', async (req, res) => {
  try {
    const { dataHora, petId, servicoId } = req.body;
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        dataHora: new Date(dataHora), // Converte string de data para objeto Date
        petId: parseInt(petId),
        servicoId: parseInt(servicoId),
      },
      include: { pet: true, servico: true },
    });
    res.status(201).json(novoAgendamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ (Todos)
app.get('/agendamentos', async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: { pet: true, servico: true }, // 'include' traz os dados do pet e serviço
    orderBy: { dataHora: 'asc' }
  });
  res.json(agendamentos);
});

// UPDATE (Status ou Data)
// remarcar data ou alterar status
app.put('/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataHora, status } = req.body;
    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(id) },
      data: {
        dataHora: dataHora ? new Date(dataHora) : undefined,
        status: status,
      },
    });
    res.json(agendamento);
  } catch (error) {
    res.status(404).json({ error: 'Agendamento não encontrado' });
  }
});

// DELETE
app.delete('/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.agendamento.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    res.status(404).json({ error: 'Agendamento não encontrado' });
  }
});


// servidor 
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});