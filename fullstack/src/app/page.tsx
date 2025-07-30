"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Home as HomeIcon, Wallet, PiggyBank, TrendingUp, Target, Calendar, MapPin, Mic, Camera } from "lucide-react"
import { AccountManagement } from "@/components/account-management"
import { PouchManagement } from "@/components/pouch-management"
import { useUser } from "@/contexts/user-context"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to SolFin</CardTitle>
            <CardDescription>Unable to load user data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please refresh the page to try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { title: "Overview", icon: HomeIcon, value: "overview" },
                    { title: "Accounts", icon: Wallet, value: "accounts" },
                    { title: "Pouches", icon: PiggyBank, value: "pouches" },
                    { title: "Transactions", icon: TrendingUp, value: "transactions" },
                    { title: "Goals", icon: Target, value: "goals" },
                    { title: "Calendar", icon: Calendar, value: "calendar" },
                  ].map((item) => (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton 
                        isActive={activeTab === item.value}
                        onClick={() => setActiveTab(item.value)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">SolFin</h1>
                  <p className="text-muted-foreground">Personal & Family Finance Planner</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                  <Button size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Scan Receipt
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6 lg:w-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  <TabsTrigger value="pouches">Pouches</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {activeTab === "overview" && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">$12,450.00</div>
                            <p className="text-xs text-muted-foreground">
                              +2.1% from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">$4,250.00</div>
                            <p className="text-xs text-muted-foreground">
                              +12.5% from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground rotate-180" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">$2,180.00</div>
                            <p className="text-xs text-muted-foreground">
                              -5.2% from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">48.7%</div>
                            <p className="text-xs text-muted-foreground">
                              +3.1% from last month
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Your latest financial activities</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium">Salary</p>
                                    <p className="text-sm text-muted-foreground">Income</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600">+$4,250.00</p>
                                  <p className="text-xs text-muted-foreground">Dec 1</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium">Grocery Store</p>
                                    <p className="text-sm text-muted-foreground">Food & Dining</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-red-600">-$125.50</p>
                                  <p className="text-xs text-muted-foreground">Dec 2</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium">Gas Station</p>
                                    <p className="text-sm text-muted-foreground">Transportation</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-red-600">-$45.00</p>
                                  <p className="text-xs text-muted-foreground">Dec 2</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Active Goals</CardTitle>
                            <CardDescription>Your savings progress</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">Emergency Fund</p>
                                  <Badge variant="secondary">75%</Badge>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground">$7,500 of $10,000</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">Vacation Fund</p>
                                  <Badge variant="secondary">45%</Badge>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground">$1,350 of $3,000</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="accounts">
                  {activeTab === "accounts" && <AccountManagement userId={user.id} />}
                </TabsContent>

                <TabsContent value="pouches">
                  {activeTab === "pouches" && <PouchManagement userId={user.id} />}
                </TabsContent>

                <TabsContent value="transactions">
                  {activeTab === "transactions" && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>Your financial history</CardDescription>
                          </div>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">Monthly Salary</p>
                                <p className="text-sm text-muted-foreground">Income • Checking Account</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">+$4,250.00</p>
                              <p className="text-xs text-muted-foreground">Dec 1, 2024</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Whole Foods Market</p>
                                <p className="text-sm text-muted-foreground">Groceries • Credit Card</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-red-600">-$125.50</p>
                              <p className="text-xs text-muted-foreground">Dec 2, 2024</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Shell Gas Station</p>
                                <p className="text-sm text-muted-foreground">Transportation • Credit Card</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-red-600">-$45.00</p>
                              <p className="text-xs text-muted-foreground">Dec 2, 2024</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="goals">
                  {activeTab === "goals" && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Savings Goals</CardTitle>
                            <CardDescription>Track your financial objectives</CardDescription>
                          </div>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Goal
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Emergency Fund</CardTitle>
                                <Badge variant="outline">Active</Badge>
                              </div>
                              <CardDescription>6 months of expenses</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Progress</span>
                                  <span className="text-sm font-medium">75%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-3">
                                  <div className="bg-primary h-3 rounded-full" style={{ width: "75%" }}></div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Current</span>
                                  <span className="text-sm font-medium">$7,500</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Target</span>
                                  <span className="text-sm font-medium">$10,000</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Target Date</span>
                                  <span className="text-sm font-medium">Jun 2025</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Vacation Fund</CardTitle>
                                <Badge variant="outline">Active</Badge>
                              </div>
                              <CardDescription>Summer vacation 2025</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Progress</span>
                                  <span className="text-sm font-medium">45%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-3">
                                  <div className="bg-primary h-3 rounded-full" style={{ width: "45%" }}></div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Current</span>
                                  <span className="text-sm font-medium">$1,350</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Target</span>
                                  <span className="text-sm font-medium">$3,000</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Target Date</span>
                                  <span className="text-sm font-medium">Aug 2025</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="calendar">
                  {activeTab === "calendar" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Bill Calendar</CardTitle>
                        <CardDescription>Upcoming bills and recurring payments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Rent Payment</p>
                                <p className="text-sm text-muted-foreground">Monthly • Due Dec 5</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-red-600">$1,200.00</p>
                              <Badge variant="outline">Upcoming</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Internet Bill</p>
                                <p className="text-sm text-muted-foreground">Monthly • Due Dec 10</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-red-600">$79.99</p>
                              <Badge variant="outline">Upcoming</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">Credit Card Payment</p>
                                <p className="text-sm text-muted-foreground">Monthly • Paid Dec 1</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">$450.00</p>
                              <Badge variant="secondary">Paid</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}