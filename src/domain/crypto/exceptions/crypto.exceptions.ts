export class CryptoDomainException extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "CryptoDomainException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidSymbolException extends CryptoDomainException {
  constructor(symbol: string) {
    super(`Invalid symbol provided: ${symbol}`, "INVALID_SYMBOL", 400);
  }
}

export class DataFetchException extends CryptoDomainException {
  constructor(message: string) {
    super(`Failed to fetch crypto data: ${message}`, "DATA_FETCH_ERROR", 503);
  }
}
