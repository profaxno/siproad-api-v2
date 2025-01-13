import { ArrayNotEmpty, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, ValidateNested } from "class-validator";
import { SiproadIngredientDto } from "./siproad-ingredient.dto";
import { Type } from "class-transformer";

export class SiproadSubProductDto {
  
  @IsString()
  @MaxLength(45)
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubProductIngredientDto)
  subProductIngredientList: SubProductIngredientDto[];
  
  @IsString()
  @IsOptional()
  subProductId?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  constructor(name: string, subProductIngredientList: SubProductIngredientDto[], subProductId?: string, cost?: number, status?: boolean){
    this.name = name;
    this.subProductIngredientList = subProductIngredientList;
    this.subProductId = subProductId;
    this.cost = cost;
    this.status = status;
  }
}

export class SubProductIngredientDto {
  @IsUUID()
  ingredientId: string;

  @IsString()
  @IsOptional()
  ingredientName?: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  @IsOptional()
  ingredientCost?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  constructor(ingredientId: string, qty: number, ingredientCost?: number, unit?: string, ingredientName?: string){
    this.ingredientId = ingredientId;
    this.qty = qty;
    this.ingredientCost = ingredientCost;
    this.unit = unit;
    this.ingredientName = ingredientName;
  }
}
