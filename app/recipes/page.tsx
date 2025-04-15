"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Utensils, Filter, ChefHat, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

// Sample recipe images
const recipeImages = [
  "/placeholder.svg?height=200&width=400&text=Chicken+Salad",
  "/placeholder.svg?height=200&width=400&text=Smoothie",
  "/placeholder.svg?height=200&width=400&text=Sandwich",
  "/placeholder.svg?height=200&width=400&text=Pasta",
  "/placeholder.svg?height=200&width=400&text=Soup",
  "/placeholder.svg?height=200&width=400&text=Stir+Fry",
]

export default function RecipesPage() {
  // Get expiring ingredients from inventory
  const [expiringIngredients, setExpiringIngredients] = useState<string[]>(["Chicken", "Spinach", "Yogurt", "Bread"])

  // Sample recipe data with improved structure
  const [allRecipes, setAllRecipes] = useState([
    {
      id: 1,
      title: "Chicken & Spinach Salad",
      description: "A healthy salad with grilled chicken and fresh spinach",
      ingredients: ["Chicken", "Spinach", "Yogurt", "Olive Oil", "Lemon"],
      cookingTime: "20 mins",
      difficulty: "Easy",
      matchedIngredients: 3,
      image: recipeImages[0],
    },
    {
      id: 2,
      title: "Spinach & Yogurt Smoothie",
      description: "Refreshing smoothie perfect for breakfast",
      ingredients: ["Spinach", "Yogurt", "Banana", "Honey", "Almond Milk"],
      cookingTime: "5 mins",
      difficulty: "Easy",
      matchedIngredients: 2,
      image: recipeImages[1],
    },
    {
      id: 3,
      title: "Chicken Sandwich",
      description: "Classic chicken sandwich with fresh ingredients",
      ingredients: ["Chicken", "Bread", "Lettuce", "Tomato", "Mayo"],
      cookingTime: "15 mins",
      difficulty: "Easy",
      matchedIngredients: 2,
      image: recipeImages[2],
    },
    {
      id: 4,
      title: "Pasta with Spinach",
      description: "Creamy pasta with fresh spinach and garlic",
      ingredients: ["Pasta", "Spinach", "Garlic", "Cream", "Parmesan"],
      cookingTime: "25 mins",
      difficulty: "Medium",
      matchedIngredients: 1,
      image: recipeImages[3],
    },
  ])

  const [recipes, setRecipes] = useState(allRecipes)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Load expiring ingredients from inventory
  useEffect(() => {
    try {
      const inventory = JSON.parse(localStorage.getItem("inventory") || "[]")
      if (inventory.length > 0) {
        // Sort by days left and get the names
        const sortedItems = inventory
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
          .map((item: any) => item.name)
          .slice(0, 4) // Get top 4 items expiring soon

        if (sortedItems.length > 0) {
          setExpiringIngredients(sortedItems)
        }
      }
    } catch (error) {
      console.error("Error loading inventory:", error)
    }
  }, [])

  // Filter recipes based on search query
  useEffect(() => {
    if (!searchQuery) {
      setRecipes(allRecipes)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = allRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query)),
      )
      setRecipes(filtered)
    }
  }, [searchQuery, allRecipes])

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === "all") {
      setRecipes(allRecipes)
    } else if (value === "quick") {
      setRecipes(allRecipes.filter((recipe) => recipe.cookingTime.includes("5") || recipe.cookingTime.includes("10")))
    } else if (value === "best") {
      setRecipes([...allRecipes].sort((a, b) => b.matchedIngredients - a.matchedIngredients))
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl font-bold">Recipe Suggestions</h1>
        <Link href="/recipes/generate">
          <Button>
            <ChefHat className="mr-2 h-4 w-4" /> Generate Custom Recipe
          </Button>
        </Link>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes by name or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-coder-primary/30 focus:border-coder-primary"
          />
        </div>
      </motion.div>

      {/* Expiring ingredients section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="mb-8 border-coder-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Using Your Expiring Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {expiringIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary">
                  {ingredient}
                </Badge>
              ))}
            </div>
            <Link href="/recipes/generate">
              <Button className="w-full bg-coder-primary hover:bg-coder-primary/80 text-black">
                <Plus className="mr-2 h-4 w-4" /> Create Recipe With These Ingredients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recipe suggestions tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Recipes</TabsTrigger>
              <TabsTrigger value="quick">Quick & Easy</TabsTrigger>
              <TabsTrigger value="best">Best Match</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} expiringIngredients={expiringIngredients} index={index} />
              ))}
              {recipes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No recipes match your search. Try different ingredients or terms.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quick" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} expiringIngredients={expiringIngredients} index={index} />
              ))}
              {recipes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No quick recipes found. Try different ingredients.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="best" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} expiringIngredients={expiringIngredients} index={index} />
              ))}
              {recipes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No matching recipes found. Try adding more ingredients to your inventory.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// Recipe card component with animation
function RecipeCard({
  recipe,
  expiringIngredients,
  index,
}: { recipe: any; expiringIngredients: string[]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {recipe.matchedIngredients} ingredients match
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2 flex-grow">
          <p className="text-muted-foreground text-sm mb-4">{recipe.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.ingredients.map((ingredient: string) => (
              <Badge
                key={ingredient}
                variant={expiringIngredients.includes(ingredient) ? "default" : "outline"}
                className={expiringIngredients.includes(ingredient) ? "bg-coder-primary text-black" : ""}
              >
                {ingredient}
              </Badge>
            ))}
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {recipe.cookingTime}
            </div>
            <div className="flex items-center">
              <Utensils className="mr-1 h-4 w-4" />
              {recipe.difficulty}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/recipes/results?id=${recipe.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              View Recipe
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
