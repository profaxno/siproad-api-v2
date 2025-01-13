import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, HttpCode, HttpStatus, Query, ParseUUIDPipe } from '@nestjs/common';

import { SiproadSubProductDto } from './dto/siproad-sub-product.dto';
import { SiproadIngredientDto } from './dto/siproad-ingredient.dto';
import { SiproadResponseDto } from './dto/siproad-response-dto';
import { SiproadIngredient } from './entities/siproad-ingredient.entity';
import { SiproadSubProduct } from './entities/siproad-sub-product.entity';
import { SiproadService } from './siproad.service';

import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('siproad')
export class SiproadController {

  private readonly logger = new Logger(SiproadController.name);

  constructor(private readonly siproadService: SiproadService) {}

  // * sub products
  @Post('/subProducts/create')
  @HttpCode(HttpStatus.OK)
  createSubProduct(@Body() dto: SiproadSubProductDto) {
    this.logger.log(`>>> createSubProduct: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.siproadService.createSubProduct(dto)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< createSubProduct: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`createSubProduct: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Patch('/subProducts/update')
  @HttpCode(HttpStatus.OK)
  updateSubProduct(@Body() dto: SiproadSubProductDto) {
    this.logger.log(`>>> updateSubProduct: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.siproadService.updateSubProduct(dto)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< updateSubProduct: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`updateSubProduct: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Get('/subProducts')
  findAllSubProducts(@Query() paginationDto: PaginationDto) {
    this.logger.log(`>>> findAllSubProducts: paginationDto=${JSON.stringify(paginationDto)}`);
    const start = performance.now();

    return this.siproadService.findAllSubProducts(paginationDto)
    .then( (entities: SiproadSubProduct[]) => {
      // * Map the entities to DTOs
      return entities.map( (entity: SiproadSubProduct) => new SiproadSubProductDto(entity.name, null, entity.id) );
    })
    .then( (dtos: SiproadSubProductDto[]) => {
      const response = new SiproadResponseDto(HttpStatus.OK, 'OK', dtos);
      const end = performance.now();
      this.logger.log(`<<< findAllSubProducts: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`findAllSubProducts: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Get('/subProducts/:value')
  findOneSubProductWithRecipe(@Param('value') value: string) {
    this.logger.log(`>>> findOneSubProductWithRecipe: value=${value}`);
    const start = performance.now();

    return this.siproadService.findOneSubProductWithRecipe(value)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< findOneSubProductWithRecipe: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`findOneSubProductWithRecipe: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })

  }

  @Delete('subProducts/:id')
  removeSubProduct(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`>>> removeSubProduct: id=${id}`);
    const start = performance.now();

    return this.siproadService.removeSubProduct(id)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< removeSubProduct: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`removeSubProduct: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  // * ingredients
  @Post('/ingredients/create')
  @HttpCode(HttpStatus.OK)
  createIngredient(@Body() dto: SiproadIngredientDto) {
    this.logger.log(`>>> createIngredient: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.siproadService.createIngredient(dto)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< createIngredient: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`createIngredient: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Patch('/ingredients/update')
  @HttpCode(HttpStatus.OK)
  updateIngredient(@Body() dto: SiproadIngredientDto) {
    this.logger.log(`>>> updateIngredient: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.siproadService.updateIngredient(dto)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< updateIngredient: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`updateIngredient: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Get('/ingredients')
  findAllIngredients(@Query() paginationDto: PaginationDto) {
    this.logger.log(`>>> findAllIngredients: paginationDto=${JSON.stringify(paginationDto)}`);
    const start = performance.now();

    return this.siproadService.findAllIngredients(paginationDto)
    .then( (entities: SiproadIngredient[]) => {
      // * Map the entities to DTOs
      return entities.map( (entity: SiproadIngredient) => new SiproadIngredientDto(entity.name, entity.cost, entity.stock, entity.unit, entity.id) );
    })
    .then( (dtos: SiproadIngredientDto[]) => {
      const response = new SiproadResponseDto(HttpStatus.OK, 'OK', dtos);
      const end = performance.now();
      this.logger.log(`<<< findAllIngredients: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`findAllIngredients: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Get('/ingredients/:value')
  findOneIngredient(@Param('value') value: string) {
    this.logger.log(`>>> findOneIngredient: value=${value}`);
    const start = performance.now();

    return this.siproadService.findOneIngredientByValue(value)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< findOneIngredient: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`findOneIngredient: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })

  }

  @Delete('ingredients/:id')
  removeIngredient(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`>>> removeIngredient: id=${id}`);
    const start = performance.now();

    return this.siproadService.removeIngredient(id)
    .then( (response: SiproadResponseDto) => {
      const end = performance.now();
      this.logger.log(`<<< removeIngredient: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(`removeIngredient: error=${error.stack}`);
      return new SiproadResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }
  
}
