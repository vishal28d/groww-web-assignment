import { BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  onAddWidget: () => void;
}

export function EmptyState({ onAddWidget }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
        <BarChart3 className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Build Your Finance Dashboard
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Create custom widgets by connecting to any finance API. Track stocks, crypto, exchange rates, and more in real-time.
      </p>

      <button
        onClick={onAddWidget}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 btn-primary-glow"
      >
        <span className="text-lg leading-none">+</span>
        Add Your First Widget
      </button>

      {/* Example APIs */}
      <div className="mt-12 w-full max-w-2xl">
        <p className="text-xs text-muted-foreground mb-4">Example APIs you can use:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
          {[
            {
              name: 'Coinbase Exchange Rates',
              url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
            },
            {
              name: 'Open Exchange Rates',
              url: 'https://open.er-api.com/v6/latest/USD',
            },
            {
              name: 'CoinGecko Bitcoin',
              url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,inr,eur',
            },
            {
              name: 'NBP Exchange Rates',
              url: 'https://api.nbp.pl/api/exchangerates/tables/A/?format=json',
            },
          ].map((api) => (
            <div
              key={api.name}
              className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <p className="text-sm font-medium text-foreground">{api.name}</p>
              <p className="text-xs text-muted-foreground truncate">{api.url}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
