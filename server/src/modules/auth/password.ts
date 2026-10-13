import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/** Compared against when the email is unknown, so both login failures take the same time. */
export const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', BCRYPT_COST);
