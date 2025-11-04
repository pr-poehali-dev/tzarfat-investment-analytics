import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const API_URL = 'https://functions.poehali.dev/1cbe5175-57ec-4d6b-bfa8-646c275977a5';

interface Trade {
  id: number;
  ticker: string;
  trade_type: string;
  quantity: number;
  price: number;
  total: number;
  time: string;
}

interface PortfolioSnapshot {
  month: string;
  value: number;
  profit: number;
}

interface Asset {
  asset: string;
  percent: number;
  value: number;
}

interface TopHolding {
  ticker: string;
  name: string;
  change: string;
  value: number;
}

interface AnalyticsData {
  trades: Trade[];
  portfolio: PortfolioSnapshot[];
  assets: Asset[];
  topHoldings: TopHolding[];
  summary: {
    totalAssets: number;
    totalProfit: number;
    todayTrades: number;
  };
}

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
          <p className="text-foreground text-xl mb-2">Ошибка загрузки данных</p>
          <p className="text-muted-foreground">Попробуйте обновить страницу</p>
        </div>
      </div>
    );
  }

  const recentTrades = data.trades.map(t => ({
    id: t.id,
    ticker: t.ticker,
    type: t.trade_type,
    qty: t.quantity,
    price: t.price,
    total: t.total,
    time: t.time
  }));

  const portfolioData = data.portfolio;
  const assetsAllocation = data.assets;
  const topStocks = data.topHoldings;
  const totalAssets = data.summary.totalAssets;
  const totalProfit = data.summary.totalProfit;
  const todayTrades = data.summary.todayTrades;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="TrendingUp" size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Tzarfat Investment Partners</h1>
                <p className="text-xs text-muted-foreground">Professional Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Assets</p>
                <p className="text-lg font-bold font-mono text-foreground">${totalAssets.toLocaleString()}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-success animate-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass mb-8 p-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" size={16} />
              Главная
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Icon name="LineChart" size={16} />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Icon name="FileText" size={16} />
              Отчеты
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <Icon name="PieChart" size={16} />
              Портфель
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="TrendingUp" className="text-primary" size={24} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-mono">+8.7%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Общая прибыль</p>
                <p className="text-2xl font-bold font-mono">${totalProfit.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">С начала года</p>
              </Card>

              <Card className="glass p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon name="Activity" className="text-secondary" size={24} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-mono">{todayTrades}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Сделок сегодня</p>
                <p className="text-2xl font-bold font-mono">{recentTrades.length}</p>
                <p className="text-xs text-muted-foreground mt-2">Объем торгов</p>
              </Card>

              <Card className="glass p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Icon name="Wallet" className="text-warning" size={24} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-mono">4</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Активных позиций</p>
                <p className="text-2xl font-bold font-mono">$820K</p>
                <p className="text-xs text-muted-foreground mt-2">Открытые ордера</p>
              </Card>

              <Card className="glass p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon name="Target" className="text-success" size={24} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-mono">87%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                <p className="text-2xl font-bold font-mono">142/163</p>
                <p className="text-xs text-muted-foreground mt-2">Прибыльных сделок</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass p-6 lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Динамика портфеля</h3>
                  <p className="text-sm text-muted-foreground">Изменение стоимости за 6 месяцев</p>
                </div>
                <ChartContainer
                  config={{
                    value: {
                      label: "Стоимость",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>

              <Card className="glass p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Последние сделки</h3>
                  <p className="text-sm text-muted-foreground">Активность за сегодня</p>
                </div>
                <div className="space-y-4">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono font-semibold text-sm">{trade.ticker}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${trade.type === 'Покупка' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                            {trade.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{trade.qty} × ${trade.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm">${trade.total}</p>
                        <p className="text-xs text-muted-foreground">{trade.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Торговая активность</h3>
                  <p className="text-sm text-muted-foreground">Объем и количество сделок</p>
                </div>
                <ChartContainer
                  config={{
                    volume: {
                      label: "Объем",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>

              <Card className="glass p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Прибыльность по месяцам</h3>
                  <p className="text-sm text-muted-foreground">P&L анализ</p>
                </div>
                <ChartContainer
                  config={{
                    profit: {
                      label: "Прибыль",
                      color: "hsl(var(--success))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={3} dot={{ fill: 'hsl(var(--success))', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            </div>

            <Card className="glass p-6 mt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Ключевые показатели</h3>
                <p className="text-sm text-muted-foreground">Метрики эффективности</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                  <p className="text-3xl font-bold font-mono gradient-text">2.34</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Max Drawdown</p>
                  <p className="text-3xl font-bold font-mono text-warning">-12.3%</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{width: '12%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="text-3xl font-bold font-mono text-secondary">15.8%</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="animate-fade-in">
            <Card className="glass p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Отчет по торговому счету</h3>
                <p className="text-sm text-muted-foreground">Детализация операций за период</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Время</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Тикер</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Тип</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Количество</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Цена</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono">{trade.time}</td>
                        <td className="py-3 px-4 text-sm font-mono font-semibold">{trade.ticker}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${trade.type === 'Покупка' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-right">{trade.qty}</td>
                        <td className="py-3 px-4 text-sm font-mono text-right">${trade.price}</td>
                        <td className="py-3 px-4 text-sm font-mono font-semibold text-right">${trade.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="glass p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon name="ArrowUpRight" className="text-success" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Прибыльных</p>
                    <p className="text-2xl font-bold font-mono">142</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </Card>

              <Card className="glass p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Icon name="ArrowDownRight" className="text-destructive" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Убыточных</p>
                    <p className="text-2xl font-bold font-mono">21</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-destructive h-2 rounded-full" style={{width: '13%'}}></div>
                </div>
              </Card>

              <Card className="glass p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="DollarSign" className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Средняя прибыль</p>
                    <p className="text-2xl font-bold font-mono">$2,641</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">На успешную сделку</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Структура портфеля</h3>
                  <p className="text-sm text-muted-foreground">Распределение активов</p>
                </div>
                <div className="space-y-4">
                  {assetsAllocation.map((asset, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{asset.asset}</span>
                        <span className="text-sm font-mono font-bold">{asset.percent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            idx === 0 ? 'bg-primary' : 
                            idx === 1 ? 'bg-secondary' : 
                            idx === 2 ? 'bg-warning' : 
                            'bg-success'
                          }`} 
                          style={{width: `${asset.percent}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">${asset.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Топ активы</h3>
                  <p className="text-sm text-muted-foreground">По доходности</p>
                </div>
                <div className="space-y-4">
                  {topStocks.map((stock, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="font-mono font-bold text-sm text-primary">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-mono font-semibold text-sm">{stock.ticker}</p>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold text-success">{stock.change}</p>
                        <p className="text-xs text-muted-foreground font-mono">${Number(stock.value).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="glass p-6 mt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Диверсификация по секторам</h3>
                <p className="text-sm text-muted-foreground">Распределение по отраслям</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { sector: 'Technology', percent: 35, color: 'bg-primary' },
                  { sector: 'Finance', percent: 25, color: 'bg-secondary' },
                  { sector: 'Healthcare', percent: 20, color: 'bg-success' },
                  { sector: 'Energy', percent: 12, color: 'bg-warning' },
                  { sector: 'Consumer', percent: 8, color: 'bg-destructive' },
                ].map((sector, idx) => (
                  <div key={idx} className="text-center space-y-3">
                    <div className={`mx-auto w-20 h-20 rounded-full ${sector.color} flex items-center justify-center`}>
                      <span className="text-2xl font-bold font-mono text-background">{sector.percent}%</span>
                    </div>
                    <p className="text-sm font-medium">{sector.sector}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}