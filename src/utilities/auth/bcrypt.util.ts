import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

//encrypt password
export async function encryptPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

//use this to decrypt password
export async function decryptPassword(
  password: string,
  encryptedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, encryptedPassword);
}
