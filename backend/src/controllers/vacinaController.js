const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  const vacinas = await prisma.vacina.findMany({ include: { pet: true } });
  res.json(vacinas);
};

exports.getById = async (req, res) => {
  const vacina = await prisma.vacina.findUnique({
    where: { id: Number(req.params.id) },
    include: { pet: true }
  });
  if (!vacina) return res.status(404).json({ error: 'Vacina não encontrada' });
  res.json(vacina);
};

exports.create = async (req, res) => {
  const vacina = await prisma.vacina.create({ data: req.body });
  res.status(201).json(vacina);
};

exports.update = async (req, res) => {
  const vacina = await prisma.vacina.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(vacina);
};

exports.remove = async (req, res) => {
  await prisma.vacina.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
};