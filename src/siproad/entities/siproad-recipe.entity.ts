import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SiproadIngredient } from "./siproad-ingredient.entity";
import { SiproadSubProduct } from "./siproad-sub-product.entity";

@Entity("pro_recipe")
export class SiproadRecipe {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column('double')
  qty: number;
  
  @ManyToOne(
    () => SiproadSubProduct,
    (subProduct) => subProduct.recipe,
    { eager: true } 
  )
  subProduct: SiproadSubProduct;

  @ManyToOne(
    () => SiproadIngredient,
    (ingredient) => ingredient.recipe,
    { eager: true } 
  )
  ingredient: SiproadIngredient;
}
