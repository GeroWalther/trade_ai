import axios from 'axios';
import { config } from '../config';

class AnalysisService {
  async analyzeAsset(symbol, timeframe, riskLevel) {
    try {
      const response = await axios.post(
        `${config.api.baseUrl}/api/analyze-asset`,
        {
          asset: symbol,
          timeframe: timeframe,
          risk_level: riskLevel,
          account_size: 10000,
        },
        {
          timeout: config.api.timeout,
        }
      );

      // First check if we have a valid response with data
      if (response.data?.status === 'success' && response.data?.data) {
        const analysisData = response.data.data;

        // Safely construct the response object with default values
        return {
          status: 'success',
          data: {
            macro: {
              aiAnalysis: {
                summary:
                  analysisData.analysis_summary || 'No summary available',
                keyFactors: analysisData.key_factors || [],
                recommendedStrategy: {
                  direction: analysisData.strategy?.direction || 'NEUTRAL',
                  entry: {
                    price: analysisData.strategy?.entry_price || 0,
                    rationale:
                      analysisData.strategy?.entry_rationale ||
                      'No rationale available',
                  },
                  stopLoss: {
                    price: analysisData.strategy?.stop_loss || 0,
                    rationale:
                      analysisData.strategy?.stop_loss_rationale ||
                      'No rationale available',
                  },
                },
              },
            },
            news: (analysisData.news_analysis || []).map((item) => ({
              title: item.title || 'No title',
              summary: item.summary || 'No summary available',
            })),
          },
        };
      }

      // If we don't have a success status or data, return a formatted error
      return {
        status: 'error',
        data: {
          macro: {
            aiAnalysis: {
              summary: 'Analysis failed',
              keyFactors: [],
              recommendedStrategy: {
                direction: 'NEUTRAL',
                entry: { price: 0, rationale: 'Analysis unavailable' },
                stopLoss: { price: 0, rationale: 'Analysis unavailable' },
              },
            },
          },
          news: [],
        },
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw {
        message: 'Network error: Unable to connect to analysis server',
        details: error.message,
        type: 'NETWORK_ERROR',
      };
    }
  }

  async advancedMarketAnalysis(asset, term, riskLevel) {
    try {
      console.log(`Starting advanced market analysis for ${asset}...`);

      // Add a small random delay to avoid multiple simultaneous requests
      const randomDelay = Math.floor(Math.random() * 500);
      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      const response = await axios.post(
        `${config.api.baseUrl}/api/advanced-market-analysis`,
        {
          asset,
          term,
          riskLevel,
        },
        {
          timeout: config.api.timeout,
          timeoutErrorMessage:
            'The analysis is taking longer than expected. Please try again later.',
        }
      );

      console.log(`Received response for ${asset} analysis`);

      // Check if we have a valid response with data
      if (response.data?.status === 'success' && response.data?.data) {
        // Check if this is a mock response
        if (response.data?.mock) {
          console.log('Received mock data response');
        }

        return {
          status: 'success',
          data: response.data.data,
          mock: response.data?.mock || false,
        };
      }

      // If we don't have a success status or data, return a formatted error
      return {
        status: 'error',
        message:
          response.data?.message || 'Failed to get advanced market analysis',
      };
    } catch (error) {
      console.error('Advanced market analysis error:', error);

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server error response:', error.response.data);

        // Special handling for rate limit errors (429)
        if (error.response.status === 429) {
          return {
            status: 'error',
            message:
              'Rate limit exceeded when accessing market data. Please try again later.',
            isRateLimit: true,
          };
        }

        return {
          status: 'error',
          message:
            error.response.data?.message ||
            `Server error: ${error.response.status}`,
        };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return {
          status: 'error',
          message:
            'No response received from server. Please check your connection.',
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          status: 'error',
          message:
            error.message ||
            'Network error: Unable to connect to analysis server',
        };
      }
    }
  }
}

export default new AnalysisService();
