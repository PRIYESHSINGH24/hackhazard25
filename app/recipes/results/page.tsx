"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, ArrowLeft, BookmarkPlus, Share2, Printer, Clock, Utensils } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

// Sample recipe images
const recipeImages = [
  "/placeholder.svg?height=400&width=800&text=Chicken+Salad",
  "/placeholder.svg?height=400&width=800&text=Smoothie",
  "/placeholder.svg?height=400&width=800&text=Sandwich",
  "/placeholder.svg?height=400&width=800&text=Pasta",
]

// Sample recipes for demo
const sampleRecipes = [
  {
    id: 1,
    title: "Chicken & Spinach Salad",
    description: "A healthy salad with grilled chicken and fresh spinach",
    ingredients: [
      "2 cups cooked chicken breast, diced",
      "4 cups fresh spinach",
      "1/2 cup Greek yogurt",
      "2 tbsp olive oil",
      "1 lemon, juiced",
      "1/4 cup red onion, diced",
      "1/2 cup cherry tomatoes, halved",
      "Salt and pepper to taste",
    ],
    instructions: [
      "In a large bowl, combine spinach, chicken, and cherry tomatoes.",
      "In a small bowl, whisk together yogurt, olive oil, lemon juice, salt, and pepper to make the dressing.",
      "Pour the dressing over the salad and toss to coat evenly.",
      "Top with diced red onion and serve immediately.",
    ],
    cookingTime: "20 mins",
    prepTime: "10 mins",
    difficulty: "Easy",
    servings: 2,
    image: recipeImages[0],
  },
  {
    id: 2,
    title: "Spinach & Yogurt Smoothie",
    description: "Refreshing smoothie perfect for breakfast",
    ingredients: [
      "2 cups fresh spinach",
      "1 cup Greek yogurt",
      "1 ripe banana",
      "1 tbsp honey",
      "1 cup almond milk",
      "1/2 cup ice cubes",
      "1 tsp vanilla extract",
    ],
    instructions: [
      "Add all ingredients to a blender.",
      "Blend on high speed until smooth and creamy, about 1 minute.",
      "Pour into glasses and serve immediately.",
      "Garnish with a sprinkle of cinnamon if desired.",
    ],
    cookingTime: "5 mins",
    prepTime: "5 mins",
    difficulty: "Easy",
    servings: 2,
    image: recipeImages[1],
  },
  {
    id: 3,
    title: "Chicken Sandwich",
    description: "Classic chicken sandwich with fresh ingredients",
    ingredients: [
      "2 chicken breasts, cooked and sliced",
      "4 slices bread",
      "2 leaves lettuce",
      "1 tomato, sliced",
      "2 tbsp mayonnaise",
      "1 tsp mustard",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Toast the bread slices until golden brown.",
      "Spread mayonnaise and mustard on one side of each bread slice.",
      "Layer lettuce, tomato, and chicken on one slice of bread.",
      "Season with salt and pepper.",
      "Top with the second slice of bread and cut in half.",
      "Serve with chips or a side salad.",
    ],
    cookingTime: "15 mins",
    prepTime: "10 mins",
    difficulty: "Easy",
    servings: 2,
    image: recipeImages[2],
  },
  {
    id: 4,
    title: "Pasta with Spinach",
    description: "Creamy pasta with fresh spinach and garlic",
    ingredients: [
      "8 oz pasta",
      "2 cups fresh spinach",
      "3 cloves garlic, minced",
      "1/2 cup heavy cream",
      "1/4 cup grated Parmesan",
      "2 tbsp olive oil",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)",
    ],
    instructions: [
      "Cook pasta according to package directions. Reserve 1/2 cup pasta water before draining.",
      "In a large skillet, heat olive oil over medium heat. Add garlic and cook until fragrant, about 1 minute.",
      "Add spinach and cook until wilted, about 2 minutes.",
      "Pour in heavy cream and bring to a simmer.",
      "Add cooked pasta and Parmesan cheese, tossing to coat. Add pasta water as needed to thin the sauce.",
      "Season with salt, pepper, and red pepper flakes if desired.",
      "Serve hot with additional Parmesan on top.",
    ],
    cookingTime: "25 mins",
    prepTime: "10 mins",
    difficulty: "Medium",
    servings: 4,
    image: recipeImages[3],
  },
]

export default function RecipeResultsPage() {
  const [recipe, setRecipe] = useState<string | null>(null)
  const [recipeObject, setRecipeObject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const recipeId = searchParams.get("id")
  const { toast } = useToast()

  useEffect(() => {
    // First check if we have a recipe ID from the URL
    if (recipeId) {
      const foundRecipe = sampleRecipes.find((r) => r.id.toString() === recipeId)
      if (foundRecipe) {
        setRecipeObject(foundRecipe)
        setLoading(false)
        return
      }
    }

    // If no recipe ID or recipe not found, check localStorage
    const storedRecipe = localStorage.getItem("generatedRecipe")
    if (storedRecipe) {
      setRecipe(storedRecipe)
    }
    setLoading(false)
  }, [recipeId])

  // Format recipe text with proper HTML
  const formatRecipe = (text: string) => {
    // Split by double newlines to separate sections
    const sections = text.split(/\n\n+/)

    if (sections.length === 0) return text

    // Extract title from the first section
    const title = sections[0].trim()

    // Format the rest of the content
    const formattedSections = sections.slice(1).map((section, index) => {
      // Check if this section is a list (ingredients or steps)
      if (section.includes("\n1.") || section.includes("\n- ") || section.includes("\n* ")) {
        // Convert numbered or bulleted lists to HTML lists
        const listItems = section
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            // Remove list markers (1., -, *) and trim
            const content = line.replace(/^\d+\.|-|\*\s+/, "").trim()
            return content ? `<li>${content}</li>` : ""
          })
          .join("")

        return `<ul class="list-disc pl-5 my-3">${listItems}</ul>`
      }

      // Check if this is a section header
      if (
        section.toLowerCase().includes("ingredients:") ||
        section.toLowerCase().includes("instructions:") ||
        section.toLowerCase().includes("steps:") ||
        section.toLowerCase().includes("directions:")
      ) {
        const [header, ...content] = section.split("\n")
        return `<h3 class="font-bold text-lg mt-4 mb-2">${header}</h3>
                <p>${content.join("<br />")}</p>`
      }

      // Regular paragraph
      return `<p class="my-2">${section.replace(/\n/g, "<br />")}</p>`
    })

    return `
      <h2 class="text-2xl font-bold mb-4">${title}</h2>
      ${formattedSections.join("")}
    `
  }

  // Save recipe
  const saveRecipe = () => {
    // In a real app, this would save to a database
    toast({
      title: "Recipe Saved",
      description: "Recipe has been saved to your collection",
    })
  }

  // Share recipe
  const shareRecipe = () => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share Recipe",
      description: "Sharing functionality would be implemented here",
    })
  }

  // Print recipe
  const printRecipe = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl flex items-center justify-center min-h-[50vh]">
        <p>Loading recipe...</p>
      </div>
    )
  }

  if (recipeObject) {
    // Render the recipe object view
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex items-center mb-6">
          <Link href="/recipes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipes
            </Button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-6 print:shadow-none print:border-none overflow-hidden">
            <div className="relative h-64 md:h-80">
              <img
                src={recipeObject.image || "/placeholder.svg"}
                alt={recipeObject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-white">{recipeObject.title}</h1>
                  <p className="text-white/80 mt-2">{recipeObject.description}</p>
                </div>
              </div>
            </div>

            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-coder-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cooking Time</p>
                    <p className="font-medium">{recipeObject.cookingTime}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-coder-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                    <p className="font-medium">{recipeObject.prepTime}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Utensils className="mr-2 h-5 w-5 text-coder-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className="font-medium">{recipeObject.difficulty}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {recipeObject.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block h-2 w-2 rounded-full bg-coder-primary mt-2 mr-2"></span>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {recipeObject.instructions.map((step: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-coder-primary/10 text-coder-primary text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between print:hidden">
              <Button variant="outline" onClick={saveRecipe}>
                <BookmarkPlus className="mr-2 h-4 w-4" /> Save
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={shareRecipe}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button variant="outline" onClick={printRecipe}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <div className="print:hidden">
          <Link href="/recipes/generate">
            <Button className="w-full">
              <ChefHat className="mr-2 h-4 w-4" /> Generate Another Recipe
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Recipe Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find a generated recipe. Try creating a new one.</p>
          <Link href="/recipes/generate">
            <Button>Generate New Recipe</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link href="/recipes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipes
          </Button>
        </Link>
      </div>

      <Card className="mb-6 print:shadow-none print:border-none">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-lg flex items-center">
            <ChefHat className="mr-2 h-5 w-5" />
            Custom Recipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatRecipe(recipe) }} />
        </CardContent>
        <CardFooter className="flex justify-between print:hidden">
          <Button variant="outline" onClick={saveRecipe}>
            <BookmarkPlus className="mr-2 h-4 w-4" /> Save
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={shareRecipe}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" onClick={printRecipe}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="print:hidden">
        <Link href="/recipes/generate">
          <Button className="w-full">
            <ChefHat className="mr-2 h-4 w-4" /> Generate Another Recipe
          </Button>
        </Link>
      </div>
    </div>
  )
}
