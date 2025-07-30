"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Wallet, CreditCard, PiggyBank, TrendingUp, Bitcoin } from "lucide-react"
import { AccountType } from "@prisma/client"

interface Account {
  id: string
  name: string
  type: AccountType
  currency: string
  initialBalance: number
  currentBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AccountFormData {
  name: string
  type: AccountType
  currency: string
  initialBalance: number
}

const accountTypeIcons = {
  CASH: Wallet,
  SAVINGS: PiggyBank,
  CREDIT: CreditCard,
  LOAN: TrendingUp,
  CRYPTO: Bitcoin,
  INVESTMENT: TrendingUp,
  OTHER: Wallet
}

const accountTypeColors = {
  CASH: "bg-green-100 text-green-800",
  SAVINGS: "bg-blue-100 text-blue-800",
  CREDIT: "bg-red-100 text-red-800",
  LOAN: "bg-yellow-100 text-yellow-800",
  CRYPTO: "bg-purple-100 text-purple-800",
  INVESTMENT: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-gray-100 text-gray-800"
}

interface AccountManagementProps {
  userId: string
}

export function AccountManagement({ userId }: AccountManagementProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<AccountFormData>({
    name: "",
    type: AccountType.CASH,
    currency: "USD",
    initialBalance: 0
  })
  const [displayLimit, setDisplayLimit] = useState(10) // Initial display limit

  useEffect(() => {
    fetchAccounts()
  }, [userId, displayLimit]) // Re-fetch when limit changes

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/accounts?userId=${userId}&limit=${displayLimit}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
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
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : "/api/accounts"
      const method = editingAccount ? "PUT" : "POST"
      
      const body = {
        ...formData,
        userId,
        ...(editingAccount && { isActive: true })
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchAccounts()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving account:", error)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      initialBalance: account.initialBalance
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (accountId: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: "DELETE"
        })

        if (response.ok) {
          await fetchAccounts()
        }
      } catch (error) {
        console.error("Error deleting account:", error)
      }
    }
  }

  const resetForm = () => {
    setEditingAccount(null)
    setFormData({
      name: "",
      type: AccountType.CASH,
      currency: "USD",
      initialBalance: 0
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount)
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
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Account" : "Add New Account"}
                </DialogTitle>
                <DialogDescription>
                  {editingAccount 
                    ? "Update your account information below."
                    : "Create a new account to track your finances."
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
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as AccountType })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AccountType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">
                    Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="initialBalance" className="text-right">
                    Initial Balance
                  </Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingAccount ? "Update Account" : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const IconComponent = accountTypeIcons[account.type]
          return (
            <Card key={account.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <Badge className={accountTypeColors[account.type]}>
                    {account.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(account.currentBalance, account.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Balance
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      {account.currency}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
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

      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first account to track your finances.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} variant="outline">Load More</Button>
        </div>
      )}
    </div>
  )
}