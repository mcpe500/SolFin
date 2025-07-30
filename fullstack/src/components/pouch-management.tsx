"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, PiggyBank, Users, Target } from "lucide-react"
import { PouchType } from "@prisma/client"

interface Pouch {
  id: string
  name: string
  description?: string
  type: PouchType
  balance: number
  targetAmount?: number
  userId: string
  createdAt: string
  updatedAt: string
  goals?: any[]
  _count?: {
    transactions: number
  }
}

interface PouchFormData {
  name: string
  description?: string
  type: PouchType
  targetAmount?: number
}

const pouchTypeIcons = {
  PRIVATE: PiggyBank,
  SHARED: Users
}

const pouchTypeColors = {
  PRIVATE: "bg-blue-100 text-blue-800",
  SHARED: "bg-purple-100 text-purple-800"
}

interface PouchManagementProps {
  userId: string
}

export function PouchManagement({ userId }: PouchManagementProps) {
  const [pouches, setPouches] = useState<Pouch[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPouch, setEditingPouch] = useState<Pouch | null>(null)
  const [formData, setFormData] = useState<PouchFormData>({
    name: "",
    description: "",
    type: PouchType.PRIVATE,
    targetAmount: undefined
  })
  const [displayLimit, setDisplayLimit] = useState(10) // Initial display limit

  useEffect(() => {
    fetchPouches()
  }, [userId, displayLimit]) // Re-fetch when limit changes

  const fetchPouches = async () => {
    try {
      const response = await fetch(`/api/pouches?userId=${userId}&limit=${displayLimit}`)
      if (response.ok) {
        const data = await response.json()
        setPouches(data)
      }
    } catch (error) {
      console.error("Error fetching pouches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 10) // Increase limit by 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPouch ? `/api/pouches/${editingPouch.id}` : "/api/pouches"
      const method = editingPouch ? "PUT" : "POST"
      
      const body = {
        ...formData,
        userId
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchPouches()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving pouch:", error)
    }
  }

  const handleEdit = (pouch: Pouch) => {
    setEditingPouch(pouch)
    setFormData({
      name: pouch.name,
      description: pouch.description || "",
      type: pouch.type,
      targetAmount: pouch.targetAmount || undefined
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (pouchId: string) => {
    if (confirm("Are you sure you want to delete this pouch? This will also delete associated transactions.")) {
      try {
        const response = await fetch(`/api/pouches/${pouchId}`, {
          method: "DELETE"
        })

        if (response.ok) {
          await fetchPouches()
        }
      } catch (error) {
        console.error("Error deleting pouch:", error)
      }
    }
  }

  const resetForm = () => {
    setEditingPouch(null)
    setFormData({
      name: "",
      description: "",
      type: PouchType.PRIVATE,
      targetAmount: undefined
    })
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(amount)
  }

  const getProgressPercentage = (pouch: Pouch) => {
    if (!pouch.targetAmount) return 0
    return Math.min(100, (pouch.balance / pouch.targetAmount) * 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 70) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pouches</h2>
          <p className="text-muted-foreground">Manage your budget buckets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pouch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingPouch ? "Edit Pouch" : "Add New Pouch"}
                </DialogTitle>
                <DialogDescription>
                  {editingPouch 
                    ? "Update your pouch information below."
                    : "Create a new budget pouch to track your spending categories."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as PouchType })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select pouch type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PouchType.PRIVATE}>Private</SelectItem>
                      <SelectItem value={PouchType.SHARED}>Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetAmount" className="text-right">
                    Target Amount
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      targetAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="col-span-3"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingPouch ? "Update Pouch" : "Create Pouch"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pouches.map((pouch) => {
          const IconComponent = pouchTypeIcons[pouch.type]
          const progressPercentage = getProgressPercentage(pouch)
          const progressColor = getProgressColor(progressPercentage)
          
          return (
            <Card key={pouch.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">{pouch.name}</CardTitle>
                  </div>
                  <Badge className={pouchTypeColors[pouch.type]}>
                    {pouch.type}
                  </Badge>
                </div>
                {pouch.description && (
                  <CardDescription>{pouch.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-2xl font-bold">
                        {formatCurrency(pouch.balance)}
                      </p>
                      {pouch.targetAmount && (
                        <p className="text-sm text-muted-foreground">
                          of {formatCurrency(pouch.targetAmount)}
                        </p>
                      )}
                    </div>
                    {pouch.targetAmount && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Budget Usage</span>
                          <span>{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={progressPercentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(0)}</span>
                          <span>{formatCurrency(pouch.targetAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {pouch.goals && pouch.goals.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{pouch.goals.length} goal{pouch.goals.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      {pouch._count?.transactions || 0} transactions
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pouch)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pouch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {pouches.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pouches yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first budget pouch to track your spending categories.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Pouch
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {pouches.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} variant="outline">Load More</Button>
        </div>
      )}
    </div>
  )
}