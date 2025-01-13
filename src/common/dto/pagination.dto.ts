import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto{
    @ApiProperty({
        
    })
    @IsOptional()
    @IsPositive()
    @Min(1)
    @Type(() => Number)
    page: number;

    @ApiProperty({
        default: 10,
        minimum: 1
    })
    @IsOptional()
    @IsPositive()
    @Min(1)
    @Type(() => Number)
    limit: number;
}