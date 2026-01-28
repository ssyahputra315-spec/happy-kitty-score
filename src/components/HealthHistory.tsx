import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HealthRecord, 
  getStatusInfo, 
  getRecordsForCat, 
  Cat,
  getWeightRecordsForCat,
  getPreferredWeightUnit,
  convertWeight
} from '@/lib/healthStorage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Scale, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface HealthHistoryProps {
  cat: Cat;
  onBack: () => void;
}

type ChartTab = 'health' | 'weight' | 'combined';

export const HealthHistory = ({ cat, onBack }: HealthHistoryProps) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('health');
  const records = getRecordsForCat(cat.id);
  const weightRecords = getWeightRecordsForCat(cat.id);
  const preferredUnit = getPreferredWeightUnit();

  const healthChartData = [...records]
    .reverse()
    .slice(-14)
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: record.percentage,
      status: record.status,
    }));

  const weightChartData = [...weightRecords]
    .reverse()
    .slice(-14)
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: convertWeight(record.weight, record.unit, preferredUnit),
    }));

  // Combined chart data - merge by date
  const combinedChartData = (() => {
    const dateMap = new Map<string, { date: string; score?: number; weight?: number }>();
    
    [...records].reverse().slice(-14).forEach(record => {
      const dateKey = record.date;
      const dateLabel = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(dateKey, { ...dateMap.get(dateKey), date: dateLabel, score: record.percentage });
    });
    
    [...weightRecords].reverse().slice(-14).forEach(record => {
      const dateKey = record.date;
      const dateLabel = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = dateMap.get(dateKey) || { date: dateLabel };
      dateMap.set(dateKey, { 
        ...existing, 
        weight: convertWeight(record.weight, record.unit, preferredUnit) 
      });
    });
    
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data);
  })();

  const getStatusColorClass = (status: HealthRecord['status']) => {
    switch (status) {
      case 'excellent': return 'bg-status-excellent';
      case 'good': return 'bg-status-good';
      case 'warning': return 'bg-status-warning';
      case 'critical': return 'bg-status-critical';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-lg">
          {cat.photo ? (
            <img src={cat.photo} alt={cat.name} className="w-full h-full object-cover" />
          ) : (
            '🐱'
          )}
        </div>
        <div>
          <h2 className="font-bold text-foreground">{cat.name}'s History</h2>
          <p className="text-xs text-muted-foreground">{records.length} health records</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-muted-foreground">No health records yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your first daily check to start tracking!
          </p>
        </div>
      ) : (
        <>
          {/* Chart Tabs */}
          {(healthChartData.length > 1 || weightChartData.length > 1) && (
            <div className="space-y-4">
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('health')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === 'health' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Activity className="w-4 h-4" />
                  Health
                </button>
                <button
                  onClick={() => setActiveTab('weight')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === 'weight' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Scale className="w-4 h-4" />
                  Weight
                </button>
                <button
                  onClick={() => setActiveTab('combined')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === 'combined' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  Both
                </button>
              </div>

              {/* Health Chart */}
              {activeTab === 'health' && healthChartData.length > 1 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Health Score Trend</h3>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthChartData}>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Health Score']}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Weight Chart */}
              {activeTab === 'weight' && weightChartData.length > 0 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-5 h-5 text-status-good" />
                    <h3 className="font-semibold text-foreground">Weight Trend ({preferredUnit})</h3>
                  </div>
                  {weightChartData.length > 1 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightChartData}>
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={35}
                            domain={['dataMin - 0.5', 'dataMax + 0.5']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [`${value} ${preferredUnit}`, 'Weight']}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="hsl(var(--status-good))"
                            strokeWidth={3}
                            dot={{ fill: 'hsl(var(--status-good))', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: 'hsl(var(--status-good))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <p>Log at least 2 weights to see the trend</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'weight' && weightChartData.length === 0 && (
                <div className="bg-card rounded-xl p-6 shadow-card text-center">
                  <Scale className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No weight records yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start logging weights from the dashboard
                  </p>
                </div>
              )}

              {/* Combined Chart */}
              {activeTab === 'combined' && combinedChartData.length > 1 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Health & Weight</h3>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={combinedChartData}>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          yAxisId="health"
                          orientation="left"
                          domain={[0, 100]}
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          width={25}
                        />
                        <YAxis 
                          yAxisId="weight"
                          orientation="right"
                          domain={['dataMin - 0.5', 'dataMax + 0.5']}
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number, name: string) => {
                            if (name === 'score') return [`${value}%`, 'Health'];
                            return [`${value} ${preferredUnit}`, 'Weight'];
                          }}
                        />
                        <Legend 
                          formatter={(value) => value === 'score' ? 'Health %' : `Weight (${preferredUnit})`}
                        />
                        <Line
                          yAxisId="health"
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                        <Line
                          yAxisId="weight"
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--status-good))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--status-good))', strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Records List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Daily Records</h3>
            {records.map((record, index) => {
              const statusInfo = getStatusInfo(record.status);
              return (
                <motion.div
                  key={record.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      getStatusColorClass(record.status)
                    )} />
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{record.percentage}%</p>
                    <p className="text-xs text-muted-foreground">score</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
};
