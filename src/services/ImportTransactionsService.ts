import { readFileSync } from 'fs';
import path from 'path';
import { parse } from 'papaparse';
import { In, getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id?: number;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<TransactionDTO[]> {
    // TODO
    const filePath = path.resolve(__dirname, '..', 'assets', filename);
    const data = await readFileSync(filePath, 'utf-8');

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    let categories: string[] = [];
    const importedData = parse(data, {
      complete: result => result.data,
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
      transformHeader(h) {
        return h.trim();
      },
    });

    const transactions: TransactionDTO[] = importedData.data as TransactionDTO[];

    const formatedData: Array<TransactionDTO> = transactions.map(
      transaction => {
        let { title, type, category } = transaction;
        const { value } = transaction;
        title = title.trim();
        type = type.trim() as 'income' | 'outcome';
        category = category.trim();
        return { title, category, value, type };
      },
    );

    formatedData.forEach(transaction => {
      const { category } = transaction;
      if (!categories.includes(category)) {
        categories = [...categories, category];
      }
    });

    const categoriesRepository = getRepository(Category);

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    existentCategories.forEach(category => {
      categories = categories.filter(
        newCategory => newCategory !== category.title,
      );
    });

    const newCategories = categoriesRepository.create(
      categories.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = await categoriesRepository.find();

    const newTransactions: CreateTransactionDTO[] = formatedData.map(
      transaction => {
        const { title, type, category } = transaction;
        const { value } = transaction;

        const category_id = allCategories.filter(
          cat => cat.title === category,
        )[0].id;

        return { title, type, value, category_id };
      },
    );

    const createdTransactions = await transactionsRepository.create(
      newTransactions,
    );
    await transactionsRepository.save(createdTransactions);
    return formatedData;
  }
}

export default ImportTransactionsService;
