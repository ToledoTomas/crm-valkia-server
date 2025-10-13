# CRM Valkia Backend

This is the backend service for CRM Valkia, built with [NestJS](https://nestjs.com/) framework and TypeScript.

## Description

CRM Valkia is a Customer Relationship Management system that provides RESTful API endpoints for managing products and related business operations.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### Products

The following endpoints are available for product management:

```
GET    /product      - Get all products
GET    /product/:id  - Get a specific product by ID
POST   /product      - Create a new product
PATCH  /product/:id  - Update an existing product
DELETE /product/:id  - Delete a product
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Technologies

- NestJS v11.0
- TypeORM
- PostgreSQL
- TypeScript
- Jest (for testing)

## Project Structure

```
src/
  ├── product/              # Product module
  │   ├── dto/             # Data Transfer Objects
  │   ├── entities/        # Database entities
  │   ├── product.controller.ts
  │   ├── product.module.ts
  │   └── product.service.ts
  ├── app.module.ts        # Main application module
  └── main.ts             # Application entry point
```

## Development

The project uses the following development tools:

- ESLint for code linting
- Prettier for code formatting
- Jest for testing

You can format your code using:

```bash
$ npm run format
```

And lint your code with:

```bash
$ npm run lint
```
