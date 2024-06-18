import { HttpException, HttpStatus } from '@nestjs/common';

class ExampleErrors extends HttpException {}

export class ExampleNotFound extends ExampleErrors {
  constructor(id: string) {
    const message = `The example with the id ${id} not found or it was already deleted`;

    super(
      {
        status: HttpStatus.NOT_FOUND,
        message,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ExampleNotDeleted extends ExampleErrors {
  constructor(error) {
    super(
      {
        error,
        message:
          'An unexpected error ocurred while trying to delete the example',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
