import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SiproadRecipe } from "./siproad-recipe.entity";

@Entity("pro_sub_product")
export class SiproadSubProduct {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { 
    length: 45,
    unique: true
  })
  name: string;

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
