import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, InsertResult, Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { PaginationDto } from 'src/common/dto/pagination.dto';

import { SiproadSubProductDto, SubProductIngredientDto } from './dto/siproad-sub-product.dto';
import { SiproadIngredientDto } from './dto/siproad-ingredient.dto';
import { SiproadResponseDto } from './dto/siproad-response-dto';

import { SiproadSubProduct } from './entities/siproad-sub-product.entity';
import { SiproadIngredient } from './entities/siproad-ingredient.entity';
import { SiproadRecipe } from './entities/siproad-recipe.entity';
import { create } from 'domain';


@Injectable()
export class SiproadService {

  private readonly logger = new Logger(SiproadService.name);

  constructor(
    @InjectRepository(SiproadSubProduct)
    private readonly siproadSubProductRepository: Repository<SiproadSubProduct>,

    @InjectRepository(SiproadIngredient)
    private readonly siproadIngredientRepository: Repository<SiproadIngredient>,

    @InjectRepository(SiproadRecipe)
    private readonly siproadRecipeRepository: Repository<SiproadRecipe>
  ){}

  // * sub products
  updateSubProduct(dto: SiproadSubProductDto): Promise<SiproadResponseDto> {
    if(!dto.subProductId)
      return this.createSubProduct(dto); // * create
    
    this.logger.log(`updateSubProduct: init process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find sub product
    return this.findOneSubProduct(dto.subProductId)
    .then( (entity: SiproadSubProduct) => {

      // * validate
      if(!entity){
        const msg = `sub product not found, id=${dto.subProductId}`;
        this.logger.warn(`updateSubProduct: ${msg}`);
        return new SiproadResponseDto(HttpStatus.NOT_FOUND, msg);  
      }

      // * update
      entity.name = dto.name;

      return this.saveSubProduct(entity) // * update sub product
      .then( (entity: SiproadSubProduct) => this.updateRecipe(entity, dto.subProductIngredientList) ) // * create recipe
      .then( (recipeList: SiproadRecipe[]) => this.generateSubProductWithRecipe(entity, recipeList) ) // * generate sub product with recipe
      .then( (siproadSubProductDto: SiproadSubProductDto) => {
        const end = performance.now();
        this.logger.log(`updateSubProduct: executed, runtime=${(end - start) / 1000} seconds`);
        return new SiproadResponseDto(HttpStatus.OK, 'updated OK', siproadSubProductDto);
      })
      
    })

  }

  createSubProduct(dto: SiproadSubProductDto): Promise<SiproadResponseDto> {
    this.logger.log(`createSubProduct: init process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find sub product
    return this.findOneSubProduct(dto.name)
    .then( (entity: SiproadSubProduct) => {

      // * validate
      if(entity){
        const msg = `sub product already exists, name=${dto.name}`;
        this.logger.warn(`createSubProduct: ${msg}`);
        return new SiproadResponseDto(HttpStatus.BAD_REQUEST, msg);
      }

      
      // * create
      entity = new SiproadSubProduct();
      entity.name = dto.name;

      return this.saveSubProduct(entity) // * create sub product
      .then( (entity: SiproadSubProduct) => {

        return this.updateRecipe(entity, dto.subProductIngredientList) // * create recipe
        .then( (recipeList: SiproadRecipe[]) => this.generateSubProductWithRecipe(entity, recipeList) ) // * generate sub product with recipe
        .then( (subProductDto: SiproadSubProductDto) => {

          const end = performance.now();
          this.logger.log(`createSubProduct: created OK, runtime=${(end - start) / 1000} seconds`);
          return new SiproadResponseDto(HttpStatus.CREATED, 'created OK', subProductDto);
        })

      })

    })

  }

  findAllSubProducts(dto: PaginationDto): Promise<SiproadSubProduct[]> {
    const {page, limit} = dto;
    
    return this.siproadSubProductRepository.find({
      take: limit,
      skip: (page - 1) * limit,// ! TIPS: Se multiplica la pagina por el limit para "saltarse" esa cantidad de registros y simular que paso de pagina (la resta es para que la primera pagina sea la 1 y no la 0)
      // relations: {
      //   images: true
      // }
      where: { status: true }
    })
    
  }

  findOneSubProductWithRecipe(value: string): Promise<SiproadResponseDto> {
    const start = performance.now();

    // * find sub product
    return this.findOneSubProduct(value)
    .then( (subProduct: SiproadSubProduct) => {
      
      if(!subProduct){
        const msg = `sub product not found, value=${value}`;
        return new SiproadResponseDto(HttpStatus.NOT_FOUND, msg);
      }

      // * find recipe
      return this.siproadRecipeRepository.findBy( { subProduct: subProduct } )
      .then( (recipeList: SiproadRecipe[]) => this.generateSubProductWithRecipe(subProduct, recipeList)) // * generate sub product with recipe
      .then( (dto: SiproadSubProductDto) => {

        const end = performance.now();
        this.logger.log(`findOneSubProductWithRecipe: executed, runtime=${(end - start) / 1000} seconds`);
        return new SiproadResponseDto(HttpStatus.OK, 'OK', dto);
      })

    })
    
  }

  removeSubProduct(id: string): Promise<SiproadResponseDto> {
    this.logger.log(`removeSubProduct: init process... id=${id}`);
    const start = performance.now();

    // * find sub product
    return this.findOneSubProduct(id)
    .then( (entity: SiproadSubProduct) => {
      
      // * validate
      if(!entity){
        const msg = `sub product not found, id=${id}`;
        return new SiproadResponseDto(HttpStatus.NOT_FOUND, msg);
      }

      // * remove
      return this.siproadRecipeRepository.findBy( { subProduct: entity } ) // * find recipe
      .then( (recipeList: SiproadRecipe[]) => this.siproadRecipeRepository.remove(recipeList)) // * remove recipes
      .then( () => this.siproadSubProductRepository.remove(entity) ) // * remove sub product
      .then( (entity: SiproadSubProduct) => {

        const end = performance.now();
        this.logger.log(`removeSubProduct: OK, runtime=${(end - start) / 1000} seconds`);
        return new SiproadResponseDto(HttpStatus.OK, 'delete OK');

      })

    })

  }

  private findOneSubProduct(value: string): Promise<SiproadSubProduct> {

    if(isUUID(value)){
      return this.siproadSubProductRepository.findOneBy({ id: value }); // * find by id
    }
    
    return this.siproadSubProductRepository.createQueryBuilder('pro_sub_product') // * find by name
    .where('UPPER(name) = :name', {
      name: value.toUpperCase()
    })
    //.leftJoinAndSelect('product.images', 'prodImages')
    .getOne()
    
  }

  private saveSubProduct(entity: SiproadSubProduct): Promise<SiproadSubProduct> {
    const start = performance.now();

    const newEntity: SiproadSubProduct = this.siproadSubProductRepository.create(entity);

    return this.siproadSubProductRepository.save(newEntity)
    .then( (entity: SiproadSubProduct) => {
      const end = performance.now();
      this.logger.log(`saveSubProduct: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }

  private updateRecipe(subProduct: SiproadSubProduct, subProductIngredientList: SubProductIngredientDto[]): Promise<SiproadRecipe[]> {
    this.logger.log(`updateRecipe: init process... subProduct=${JSON.stringify(subProduct)}, subProductIngredientList=${JSON.stringify(subProductIngredientList)}`);
    const start = performance.now();

    // * find ingredients by id
    const ingredientIdList = subProductIngredientList.map( (item) => item.ingredientId );

    return this.siproadIngredientRepository.findBy({
      id: In(ingredientIdList),
    })
    .then( (ingredientList: SiproadIngredient[]) => {

      // * validate
      if(ingredientList.length !== ingredientIdList.length){
        const ingredientIdNotFoundList: string[] = ingredientIdList.filter( (id) => !ingredientList.find( (ingredient) => ingredient.id == id) );
        const msg = `ingredients not found, idList=${JSON.stringify(ingredientIdNotFoundList)}`;
        throw new NotFoundException(msg); 
      }

      // * create recipe
      return this.siproadRecipeRepository.findBy( { subProduct } ) // * find recipe
      .then( (recipeList: SiproadRecipe[]) => this.siproadRecipeRepository.remove(recipeList)) // * remove recipes
      .then( () => {
        
        // * generate recipes
        const recipeList: SiproadRecipe[] = ingredientList.map( (ingredient: SiproadIngredient) => {
          const recipe = new SiproadRecipe();
          recipe.subProduct = subProduct;
          recipe.ingredient = ingredient;
          recipe.qty = subProductIngredientList.find( (ingredientDto) => ingredientDto.ingredientId == ingredient.id).qty;
          return recipe;
        })
  
        // * bulk insert
        return this.bulkInsertRecipes(recipeList)
        .then( (recipeList: SiproadRecipe[]) => {
          const end = performance.now();
          this.logger.log(`updateRecipe: OK, runtime=${(end - start) / 1000} seconds`);
          return recipeList;
        })

      })


    })

  }

  private bulkInsertRecipes(recipeList: SiproadRecipe[]): Promise<SiproadRecipe[]> {
    const start = performance.now();
    this.logger.log(`bulkInsertRecipes: init process... listSize=${recipeList.length}`);

    const newRecipeList: SiproadRecipe[] = recipeList.map( (value) => this.siproadRecipeRepository.create(value));
    
    return this.siproadRecipeRepository.manager.transaction( async(transactionalEntityManager) => {
      
      return transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(SiproadRecipe)
        .values(newRecipeList)
        .execute()
        .then( (insertResult: InsertResult) => {
          const end = performance.now();
          this.logger.log(`bulkInsertRecipes: OK, runtime=${(end - start) / 1000} seconds, insertResult=${JSON.stringify(insertResult.raw)}`);
          return newRecipeList;
        })
    })
  }

  private generateSubProductWithRecipe(subProduct: SiproadSubProduct, recipeList: SiproadRecipe[]): Promise<SiproadSubProductDto> {
    // * map ingredients
    const subProductIngredientDtoList: SubProductIngredientDto[] = recipeList.map( (recipe: SiproadRecipe) => new SubProductIngredientDto(recipe.ingredient.id, recipe.qty, recipe.ingredient.cost, recipe.ingredient.unit, recipe.ingredient.name) );
            
    // * calculate cost
    const cost: number = recipeList.reduce( (cost, recipe) => cost + (recipe.qty * recipe.ingredient.cost), 0);

    // * generate sub product dto
    const subProductDto = new SiproadSubProductDto(subProduct.name, subProductIngredientDtoList, subProduct.id, cost, subProduct.status);

    return Promise.resolve(subProductDto);
  }

  // * ingredients
  updateIngredient(dto: SiproadIngredientDto): Promise<SiproadResponseDto> {
    if(!dto.id)
      return this.createIngredient(dto); // * create
    
    this.logger.log(`updateIngredient: init process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find sub product
    return this.findOneIngredient(dto.id)
    .then( (entity: SiproadIngredient) => {

      // * validate
      if(!entity){
        const msg = `ingredient not found, id=${dto.id}`;
        this.logger.warn(`updateIngredient: ${msg}`);
        return new SiproadResponseDto(HttpStatus.NOT_FOUND, msg);  
      }

      // * update
      entity.name = dto.name;
      entity.cost = dto.cost;
      entity.stock = dto.stock;
      entity.unit = dto.unit;
      
      return this.saveIngredient(entity)
      .then( (entity: SiproadIngredient) => {

        // * map to dto
        const siproadSubProductDto = new SiproadIngredientDto(entity.name, entity.cost, entity.stock, entity.unit, entity.id);

        const end = performance.now();
        this.logger.log(`updateIngredient: executed, runtime=${(end - start) / 1000} seconds`);
        return new SiproadResponseDto(HttpStatus.OK, 'updated OK', siproadSubProductDto);
      })
      
    })

  }

  createIngredient(dto: SiproadIngredientDto): Promise<SiproadResponseDto> {
    this.logger.log(`createIngredient: init process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find ingredient
    return this.findOneIngredient(dto.name)
    .then( (entity: SiproadIngredient) => {

      // * validate
      if(entity){
        const msg = `ingredient already exists, name=${dto.name}`;
        this.logger.warn(`createIngredient: ${msg}`);
        return new SiproadResponseDto(HttpStatus.BAD_REQUEST, msg);
      }

      // * create
      entity = new SiproadIngredient();
      entity.name = dto.name;
      entity.cost = dto.cost;
      entity.stock = dto.stock;
      entity.unit = dto.unit;

      return this.saveIngredient(entity)
      .then( (entity: SiproadIngredient) => {
        const dto = new SiproadIngredientDto(entity.name, entity.cost, entity.stock, entity.unit, entity.id)
        const end = performance.now();
        this.logger.log(`createIngredient: OK, runtime=${(end - start) / 1000} seconds`);
        return new SiproadResponseDto(HttpStatus.CREATED, 'created OK', dto);
      })

    })

  }

  findAllIngredients(dto: PaginationDto): Promise<SiproadIngredient[]> {
    const {page, limit} = dto;
    
    return this.siproadIngredientRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      // relations: {
      //   images: true
      // }
      where: { status: true }
    })
    
  }

  findOneIngredientByValue(value: string): Promise<SiproadResponseDto> {
    const start = performance.now();

    // * find ingredient
    return this.findOneIngredient(value)
    .then( (entity: SiproadIngredient) => {
      
      if(!entity){
        const msg = `ingredient not found, value=${value}`;
        return new SiproadResponseDto(HttpStatus.NOT_FOUND, msg);
      }

      const dto = new SiproadIngredientDto(entity.name, entity.cost, entity.stock, entity.unit, entity.id);
      const end = performance.now();
      this.logger.log(`findOneIngredientByValue: executed, runtime=${(end - start) / 1000} seconds`);
      return new SiproadResponseDto(HttpStatus.OK, 'OK', dto);
    })
    
  }

  

  removeIngredient(id: string): Promise<SiproadResponseDto> {
    this.logger.log(`removeIngredient: init process... id=${id}`);
    const start = performance.now();

    return this.findOneIngredient(id)
    .then( (entity: SiproadIngredient) => {
      
      // * validate
      if(!entity){
        const msg = `ingredient not found, id=${id}`;
        return new SiproadResponseDto(HttpStatus.NOT_FOUND, msg);
      }

      // * remove
      return this.siproadIngredientRepository.remove(entity)
      .then( (entity: SiproadIngredient) => {
        const end = performance.now();
        this.logger.log(`removeIngredient: OK, entity=${JSON.stringify(entity)}`);
        return new SiproadResponseDto(HttpStatus.OK, 'delete OK');
      })

    })

  }

  private findOneIngredient(value: string): Promise<SiproadIngredient> {

    if(isUUID(value)){
      return this.siproadIngredientRepository.findOneBy({ id: value }); // * find by id
    }
    
    return this.siproadIngredientRepository.createQueryBuilder('pro_ingredient') // * find by name
    .where('UPPER(name) = :name', {
      name: value.toUpperCase()
    })
    .getOne();
  }

  private saveIngredient(entity: SiproadIngredient): Promise<SiproadIngredient> {
    const start = performance.now();

    const newEntity: SiproadIngredient = this.siproadIngredientRepository.create(entity);

    return this.siproadIngredientRepository.save(newEntity)
    .then( (entity: SiproadIngredient) => {
      const end = performance.now();
      this.logger.log(`saveIngredient: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }

}
