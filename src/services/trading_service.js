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

  async executeTrade(symbol, side, quantity, options = {}) {
    try {
      const requestData = {
        symbol,
        side,
        quantity,
        order_type: options.orderType || 'market',
        price: options.price, // For pending orders
        take_profit: options.takeProfit,
        stop_loss: options.stopLoss,
      };

      const response = await axios.post(
        `${config.api.tradingUrl}/execute-trade`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  }

  async closePosition(tradeId) {
    try {
      const response = await axios.post(
        `${config.api.tradingUrl}/close-position/${tradeId}`
      );
      return response.data;
    } catch (error) {
      console.error('Position closing error:', error);
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      const response = await axios.post(
        `${config.api.tradingUrl}/cancel-order/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error('Order cancellation error:', error);
      throw error;
    }
  }

  async modifyPosition(tradeId, takeProfit, stopLoss) {
    try {
      const response = await axios.post(
        `${config.api.tradingUrl}/modify-position`,
        {
          trade_id: tradeId,
          take_profit: takeProfit,
          stop_loss: stopLoss,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Position modification error:', error);
      throw error;
    }
  }
}

export default new TradingService();
