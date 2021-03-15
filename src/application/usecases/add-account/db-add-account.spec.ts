import { Encrypter } from '../../contracts'
import { DbAddAccount } from './db-add-account'

interface SutTypes {
  sut: DbAddAccount
  encrypterStub: Encrypter
}

const makeEncrypter = (): Encrypter => {
  class EncryperStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncryperStub()
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter()
  const sut = new DbAddAccount(encrypterStub)

  return { sut, encrypterStub }
}

describe('DbAddAccount', () => {
  it('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    await sut.add(accountData)
    expect(encrypterSpy).toHaveBeenCalledWith('valid_password')
  })

  it('Should throw error if Encrypter throw error', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow()
  })
})