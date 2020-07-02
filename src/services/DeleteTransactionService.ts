// import AppError from '../errors/AppError';
import { getCustomRepository, DeleteResult } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class DeleteTransactionService {
  public async execute(id: string): Promise<DeleteResult> {
    // TODO
    const transactionRepository = await getCustomRepository(
      TransactionRepository,
    );

    const deleteResult = await transactionRepository.delete(id);
    if (deleteResult.raw.length > 0) {
      return deleteResult;
    }
    throw new Error('Id not found');
  }
}

export default DeleteTransactionService;
