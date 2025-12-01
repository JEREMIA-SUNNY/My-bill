"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mealPlanData, MealPlanDay } from "@/lib/meal-plan-data"
import { RefreshCw, Utensils, Fish, Coffee, Moon, Sun } from "lucide-react"

export function MealPlanView() {
  const [randomDay, setRandomDay] = useState<MealPlanDay | null>(null)

  useEffect(() => {
    generateRandomDay()
  }, [])

  const generateRandomDay = () => {
    const randomIndex = Math.floor(Math.random() * mealPlanData.length)
    setRandomDay(mealPlanData[randomIndex])
  }

  const groupedByWeek = mealPlanData.reduce((acc, day) => {
    const weekNum = Math.ceil(day.day / 7)
    if (!acc[weekNum]) {
      acc[weekNum] = []
    }
    acc[weekNum].push(day)
    return acc
  }, {} as Record<number, MealPlanDay[]>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kerala Meal Plan</h1>
        <p className="text-muted-foreground">
          Budget-friendly (₹5000/mo) healthy meal plan with protein focus.
        </p>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="daily">Daily Suggestion</TabsTrigger>
          <TabsTrigger value="full">Full Plan</TabsTrigger>
          <TabsTrigger value="stats">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Menu Suggestion</CardTitle>
                  <CardDescription>
                    Randomly selected balanced meal plan (Day {randomDay?.day})
                  </CardDescription>
                </div>
                <Button onClick={generateRandomDay} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {randomDay && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <MealCard
                    title="Breakfast"
                    icon={<Coffee className="h-5 w-5 text-orange-500" />}
                    content={randomDay.breakfast}
                  />
                  <MealCard
                    title="Lunch"
                    icon={<Sun className="h-5 w-5 text-yellow-500" />}
                    content={randomDay.lunch}
                  />
                  <MealCard
                    title="Dinner"
                    icon={<Utensils className="h-5 w-5 text-blue-500" />}
                    content={randomDay.dinner}
                  />
                  <MealCard
                    title="Night (Light)"
                    icon={<Moon className="h-5 w-5 text-indigo-500" />}
                    content={randomDay.night}
                  />
                </div>
              )}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary" />
                <span className="font-medium">Protein Target:</span>
                <span>{randomDay?.protein}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-8 mt-4">
          {Object.entries(groupedByWeek).map(([week, days]) => (
            <Card key={week}>
              <CardHeader>
                <CardTitle>Week {week}</CardTitle>
                <CardDescription>
                  Estimated Cost: ₹{week === "1" || week === "2" || week === "3" ? "1150" : "1400"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Day</TableHead>
                        <TableHead>Breakfast</TableHead>
                        <TableHead>Lunch</TableHead>
                        <TableHead>Dinner</TableHead>
                        <TableHead>Night</TableHead>
                        <TableHead className="text-right">Protein</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {days.map((day) => (
                        <TableRow key={day.day}>
                          <TableCell className="font-medium">{day.day}</TableCell>
                          <TableCell>{day.breakfast}</TableCell>
                          <TableCell>{day.lunch}</TableCell>
                          <TableCell>{day.dinner}</TableCell>
                          <TableCell>{day.night}</TableCell>
                          <TableCell className="text-right">{day.protein}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹4850 - ₹4950</div>
                <p className="text-xs text-muted-foreground">Total Monthly Cost</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Week 1</span>
                    <span>₹1150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Week 2</span>
                    <span>₹1150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Week 3</span>
                    <span>₹1150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Week 4</span>
                    <span>₹1400</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Protein</div>
                    <div className="text-sm text-muted-foreground">60-75g / day</div>
                  </div>
                  <div>
                    <div className="font-medium">Key Sources</div>
                    <div className="text-sm text-muted-foreground">
                      Fish (Mathi, Ayila, Netholi), Eggs, Dal, Milk
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Vitamins</div>
                    <div className="text-sm text-muted-foreground">
                      Greens, Vegetables, Fruits (Papaya, Guava)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Fish included 4-5 days/week</li>
                  <li>Light meals at night</li>
                  <li>Cooking time 10-15 mins</li>
                  <li>Uses locally available Kerala items</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MealCard({ title, icon, content }: { title: string; icon: React.ReactNode; content: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="font-medium leading-tight">{content}</p>
    </div>
  )
}
