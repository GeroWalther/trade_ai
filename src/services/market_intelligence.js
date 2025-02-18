import axios from 'axios';
import { config } from '../config';

const marketIntelligenceService = {
  async getMarketAnalysis() {
    try {
      console.log('Requesting market analysis...');
      const response = await axios.get(
        `${config.api.tradingUrl}/api/market-intelligence`
      );
      console.log('Got response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  async getNewsArticles(topic) {
    try {
      const response = await axios.get(
        `${config.api.tradingUrl}/api/market-news/${topic}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching news articles:', error);
      throw error;
    }
  },
};

export default marketIntelligenceService;
