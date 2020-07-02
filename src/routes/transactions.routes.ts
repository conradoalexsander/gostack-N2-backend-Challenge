import { Router, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import uploadConfig from '../config/upload';

import CreateTransactionService from '../services/CreateTransactionService';

import TransactionsRepository from '../repositories/TransactionsRepository';

import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request: Request, response: Response) => {
  // TODO
  try {
    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );
    const transactions = await transactionsRepository.find();
    const balance = await transactionsRepository.getBalance();

    return response.json({ transactions, balance });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request: Request, response: Response) => {
  // TODO

  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    // TODO
    try {
      const { id } = request.params;

      const deleteTransaction = new DeleteTransactionService();

      const deletResult = await deleteTransaction.execute(id);

      return response.json(deletResult);
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  },
);

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request: Request, response: Response) => {
    // TODO

    const { filename } = request.file;

    const importTransactionsService = new ImportTransactionsService();
    const data = await importTransactionsService.execute(filename);

    return response.json(data);
  },
);

export default transactionsRouter;
