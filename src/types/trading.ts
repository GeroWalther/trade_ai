export interface TradingData {
  cash_available: number;
  total_portfolio_value: number;
  daily_return_pct: number;
  positions: {
    [symbol: string]: {
      quantity: number;
      entry_price: number;
      current_price: number;
      unrealized_pl: number;
    };
  };
  trading_stats: {
    win_rate: number;
    winning_trades: number;
    losing_trades: number;
  };
  market_status: {
    is_market_open: boolean;
    active_symbols: string[];
  };
}
