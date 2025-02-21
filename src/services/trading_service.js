import axios from 'axios';
import { config } from '../config';

class TradingService {
  async getTradingStatus() {
    try {
      const response = await axios.get(
        `${config.api.tradingUrl}/trading-status`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching trading status:', error);
      throw error;
    }
  }

  async executeTrade(symbol, side, quantity) {
    try {
      const response = await axios.post(
        `${config.api.tradingUrl}/execute-trade`,
        {
          symbol,
          side,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  }
}

export default new TradingService();
