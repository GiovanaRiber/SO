const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  const pets = await prisma.pet.findMany({ include: { vacinas: true, agendamentos: true } });
  res.json(pets);
};

exports.getById = async (req, res) => {
  const pet = await prisma.pet.findUnique({
    where: { id: Number(req.params.id) },
    include: { vacinas: true, agendamentos: true }
  });
  if (!pet) return res.status(404).json({ error: 'Pet não encontrado' });
  res.json(pet);
};

exports.create = async (req, res) => {
  const pet = await prisma.pet.create({ data: req.body });
  res.status(201).json(pet);
};

exports.update = async (req, res) => {
  const pet = await prisma.pet.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(pet);
};

exports.remove = async (req, res) => {
  await prisma.pet.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
};