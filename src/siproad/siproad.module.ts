import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SiproadController } from './siproad.controller';
import { SiproadService } from './siproad.service';
import { SiproadIngredient } from './entities/siproad-ingredient.entity';
import { SiproadRecipe } from './entities/siproad-recipe.entity';
import { SiproadSubProduct } from './entities/siproad-sub-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiproadSubProduct, SiproadIngredient, SiproadRecipe])
  ],
  controllers: [SiproadController],
  providers: [SiproadService],
})
export class SiproadModule {}
