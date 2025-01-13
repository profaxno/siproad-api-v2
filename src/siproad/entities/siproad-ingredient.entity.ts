import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SiproadRecipe } from "./siproad-recipe.entity";

@Entity("pro_ingredient")
export class SiproadIngredient {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { 
    length: 45,
    unique: true
  })
  name: string;

  @Column('double')
  cost: number;

  @Column('double')
  stock: number;

  @Column('varchar', { 
    length: 5,
    unique: true
  })
  unit: string;

  @Column('boolean', {
    default: true
  })
  status: boolean

  @OneToMany(
    () => SiproadRecipe,
    (recipe) => recipe.ingredient
  )
  recipe: SiproadRecipe;
}
