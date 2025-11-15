const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  const servicos = await prisma.servico.findMany({ include: { agendamentos: true } });
  res.json(servicos);
};

exports.getById = async (req, res) => {
  const servico = await prisma.servico.findUnique({
    where: { id: Number(req.params.id) },
    include: { agendamentos: true }
  });
  if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
  res.json(servico);
};

exports.create = async (req, res) => {
  const servico = await prisma.servico.create({ data: req.body });
  res.status(201).json(servico);
};

exports.update = async (req, res) => {
  const servico = await prisma.servico.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(servico);
};

exports.remove = async (req, res) => {
  await prisma.servico.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
};