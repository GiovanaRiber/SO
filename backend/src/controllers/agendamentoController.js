const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: { pet: true, servico: true }
  });
  res.json(agendamentos);
};

exports.getById = async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(req.params.id) },
    include: { pet: true, servico: true }
  });
  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json(agendamento);
};

exports.create = async (req, res) => {
  const agendamento = await prisma.agendamento.create({ data: req.body });
  res.status(201).json(agendamento);
};

exports.update = async (req, res) => {
  const agendamento = await prisma.agendamento.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(agendamento);
};

exports.remove = async (req, res) => {
  await prisma.agendamento.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
};