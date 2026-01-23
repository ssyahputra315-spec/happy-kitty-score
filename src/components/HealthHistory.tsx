import { motion } from 'framer-motion';
import { HealthRecord, getStatusInfo, getRecordsForCat, Cat } from '@/lib/healthStorage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface HealthHistoryProps {
  cat: Cat;
  onBack: () => void;
}

export const HealthHistory = ({ cat, onBack }: HealthHistoryProps) => {
  const records = getRecordsForCat(cat.id);

  const chartData = [...records]
    .reverse()
    .slice(-14)
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: record.percentage,
      status: record.status,
    }));

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
          {/* Trend Chart */}
          {chartData.length > 1 && (
            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Health Trend</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
