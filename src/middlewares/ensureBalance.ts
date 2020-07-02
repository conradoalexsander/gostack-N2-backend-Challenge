import { getCustomRepository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {

  try {
    const { type, value } = request.body;
    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Not enough balance', 400);
    }

    return next();

    catch{


    }
  }

}

export default ensureAuthenticated;
