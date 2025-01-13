import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class SiproadIngredientDto {
  
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @MaxLength(45)
  name: string;

  @IsNumber()
  cost: number;

  @IsNumber()
  stock: number;

  @IsString()
  @MaxLength(5)
  unit: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean

  constructor(name: string, cost: number, stock: number, unit: string, id?: string, status?: boolean) {
    this.name = name;
    this.cost = cost;
    this.stock = stock;
    this.unit = unit;
    this.id = id;
    this.status = status;
  }
}
