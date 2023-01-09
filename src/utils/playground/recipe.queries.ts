export const recipeQueries = /* GraphQL */ `
  query recipes {
    recipes(
      where: {
        difficulty: [EASY, HARD, NORMAL, EXPERT]
        category: SNACK
        preparationTime: PREPARATION_15
        restrictions: [LACTOSE]
        search: "term"
      }
    ) {
      edges {
        node {
          ...RecipeFragment
        }
      }
    }
  }

  query recipe {
    recipe(uuid: "") {
      ...RecipeFragment
    }
  }

  mutation toogleCook {
    toogleCook(uuid: "") {
      ...RecipeFragment
    }
  }

  fragment RecipeFragment on Recipe {
    uuid
    name
    ingredients
    pictureUrl
    videoUrl
    description
    difficulty
    category
    restrictions
    preparationTime
  }
`
