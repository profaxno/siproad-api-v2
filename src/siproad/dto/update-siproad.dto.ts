import { PartialType } from '@nestjs/mapped-types';

import { SiproadIngredientDto } from './siproad-ingredient.dto';

export class UpdateSiproadDto extends PartialType(SiproadIngredientDto) {}
