"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChefHat, Plus, X, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dietary preferences options
const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "low-carb", label: "Low Carb" },
  { id: "keto", label: "Keto" },
]

export default function GenerateRecipePage() {
  // Get expiring ingredients from inventory (in a real app, this would come from a database)
  const [expiringIngredients, setExpiringIngredients] = useState<string[]>([
    "Chicken",
    "Spinach",
    "Yogurt",
    "Bread",
    "Tomatoes",
    "Cheese",
  ])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState("")
  const [preferences, setPreferences] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Load ingredients from localStorage if available
  useEffect(() => {
    // Check if we have ingredients passed from the manual entry page
    const storedIngredients = localStorage.getItem("recipeIngredients")
    if (storedIngredients) {
      try {
        const parsedIngredients = JSON.parse(storedIngredients)
        setSelectedIngredients(parsedIngredients)
        // Clear after loading
        localStorage.removeItem("recipeIngredients")
      } catch (error) {
        console.error("Error parsing stored ingredients:", error)
      }
    } else {
      // Default to first 3 expiring ingredients
      setSelectedIngredients(expiringIngredients.slice(0, 3))
    }

    // Try to load inventory items for expiring ingredients
    try {
      const inventory = JSON.parse(localStorage.getItem("inventory") || "[]")
      if (inventory.length > 0) {
        // Sort by days left and get the names
        const sortedItems = inventory
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
          .map((item: any) => item.name)
          .slice(0, 6) // Get top 6 items expiring soon

        if (sortedItems.length > 0) {
          setExpiringIngredients(sortedItems)
        }
      }
    } catch (error) {
      console.error("Error loading inventory:", error)
    }
  }, [])

  // Add a new ingredient
  const addIngredient = () => {
    if (newIngredient.trim() && !selectedIngredients.includes(newIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, newIngredient.trim()])
      setNewIngredient("")
    }
  }

  // Remove an ingredient
  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient))
  }

  // Toggle a dietary preference
  const togglePreference = (preference: string) => {
    setPreferences(
      preferences.includes(preference) ? preferences.filter((p) => p !== preference) : [...preferences, preference],
    )
  }

  // Generate recipe
  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select at least one ingredient",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setApiKeyMissing(false)
    setUsingFallback(false)

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          preferences: preferences,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", errorData)

        if (errorData.error && errorData.error.includes("API key")) {
          setApiKeyMissing(true)
          throw new Error("Grok API key is missing")
        }

        // If we get here, it's another type of error
        setUsingFallback(true)
        throw new Error(errorData.error || "Failed to generate recipe")
      }

      const data = await response.json()

      // Store the generated recipe in localStorage for the results page
      localStorage.setItem("generatedRecipe", data.recipe)

      // Redirect to results page
      router.push("/recipes/results")
    } catch (error) {
      console.error("Error generating recipe:", error)

      if (String(error).includes("API key")) {
        setApiKeyMissing(true)
        toast({
          title: "API Key Missing",
          description: "Using demo mode with limited functionality",
          variant: "warning",
        })
      } else {
        setUsingFallback(true)
        toast({
          title: "Using Fallback Recipe Generator",
          description: "We're having trouble connecting to our AI service. Using built-in recipe generator instead.",
          variant: "info",
        })

        // Generate a fallback recipe and continue to results page
        const fallbackRecipe = generateFallbackRecipe(selectedIngredients, preferences)
        localStorage.setItem("generatedRecipe", fallbackRecipe)
        router.push("/recipes/results")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fallback recipe generator for client-side
  const generateFallbackRecipe = (ingredients: string[], preferences: string[]): string => {
    const mainIngredient = ingredients[0] || "Chicken"
    const secondaryIngredients = ingredients.slice(1).join(", ") || "vegetables"
    const dietaryInfo = preferences.length > 0 ? `(${preferences.join(", ")})` : ""

    return `# ${mainIngredient} Delight ${dietaryInfo}

A delicious and easy-to-prepare dish that makes the most of your ingredients.

## Description
This recipe transforms ${mainIngredient} into a flavorful meal that's perfect for any occasion. It's designed to use ingredients you already have to reduce food waste.

## Ingredients
- 2 cups ${mainIngredient}, prepared appropriately
- 1 tablespoon olive oil
- 2 cloves garlic, minced
- 1 onion, diced
${ingredients
  .slice(1)
  .map((ing) => `- 1 cup ${ing}`)
  .join("\n")}
- Salt and pepper to taste
- Fresh herbs for garnish

## Instructions
1. Prepare all ingredients by washing and cutting them into appropriate sizes.
2. Heat olive oil in a large pan over medium heat.
3. Add garlic and onion, sauté until fragrant and translucent.
4. Add ${mainIngredient} and cook for 5-7 minutes until it starts to brown.
5. Add ${secondaryIngredients} and continue cooking for another 5 minutes.
6. Season with salt and pepper to taste.
7. Garnish with fresh herbs before serving.

## Cooking Time and Difficulty
- Preparation: 10 minutes
- Cooking: 15 minutes
- Difficulty: Easy

Enjoy your meal!`
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ChefHat className="mr-2 h-6 w-6" />
        Generate Custom Recipe
      </h1>

      {apiKeyMissing && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-warning mb-1">Grok API Key Missing</h3>
              <p className="text-sm text-muted-foreground">
                The application is running in demo mode. Recipe generation will use pre-defined templates instead of AI.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {usingFallback && (
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-primary mb-1">Using Built-in Recipe Generator</h3>
              <p className="text-sm text-muted-foreground">
                We're currently using our built-in recipe generator instead of the AI service. Your recipes will still
                be personalized based on your ingredients.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Select Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Expiring soon in your inventory:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {expiringIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedIngredients.includes(ingredient)) {
                      removeIngredient(ingredient)
                    } else {
                      setSelectedIngredients([...selectedIngredients, ingredient])
                    }
                  }}
                >
                  {ingredient}
                  {selectedIngredients.includes(ingredient) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Add another ingredient"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addIngredient()
                  }
                }}
              />
            </div>
            <Button onClick={addIngredient} type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label className="text-base">Selected Ingredients:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ingredients selected</p>
              ) : (
                selectedIngredients.map((ingredient) => (
                  <Badge key={ingredient} className="flex items-center gap-1">
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-1 rounded-full hover:bg-primary-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {dietaryOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={preferences.includes(option.id)}
                  onCheckedChange={() => togglePreference(option.id)}
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={generateRecipe} disabled={loading || selectedIngredients.length === 0} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Recipe...
          </>
        ) : (
          <>
            <ChefHat className="mr-2 h-4 w-4" />
            Generate Recipe
          </>
        )}
      </Button>
    </div>
  )
}
