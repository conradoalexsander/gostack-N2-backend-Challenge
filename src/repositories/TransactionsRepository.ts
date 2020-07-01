import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO

    const transactions = await this.find({});

    const balance: Balance = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => ({
        ...accumulator,
        [transaction.type]:
          accumulator[transaction.type] + Number(transaction.value) || 0,
        total:
          transaction.type === 'income'
            ? Number(accumulator.total) + Number(transaction.value)
            : Number(accumulator.total) - Number(transaction.value),
      }),
      { income: 0, outcome: 0, total: 0 },
    );

    return balance;
  }
}

export default TransactionsRepository;
