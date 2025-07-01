import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import CustomBotService from '../services/custom_bot_service';
import { config } from '../config';

const API_BASE = config.api.backendUrl;

const TradingBots = () => {
  const [customBots, setCustomBots] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    code: '',
    enabled: false,
    instruments: [],
    riskLevel: 'medium',
    executionInterval: 5, // minutes
    trailingStopType: 'none', // 'none', 'fixed_pips'
    trailingStopPips: 20, // pip distance when using fixed_pips
  });

  // Available instruments for bot configuration
  const availableInstruments = [
    'EUR_USD',
    'GBP_USD',
    'USD_JPY',
    'AUD_USD',
    'USD_CAD',
    'BTC_USD',
    'SPX500_USD',
    'NAS100_USD',
    'XAU_USD',
    'BCO_USD',
  ];

  // Load custom bots from API
  useEffect(() => {
    loadBots();
    loadTemplates();
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const bots = await CustomBotService.getAllBots();
      setCustomBots(bots);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast.error('Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await fetch(`${API_BASE}/bot-templates`);
      const data = await response.json();

      if (data.status === 'success') {
        const loadedTemplates = data.templates || [];
        setTemplates(loadedTemplates);

        // Set default selected template to first available template if current selection isn't available
        if (loadedTemplates.length > 0) {
          const currentTemplateExists = loadedTemplates.some(
            (t) => t.id === selectedTemplate
          );
          if (!currentTemplateExists) {
            setSelectedTemplate(loadedTemplates[0].id);
          }
        }
      } else {
        console.error('Failed to load templates:', data.message);
        // Fallback to empty array if API fails
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to empty array if API fails
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Create new bot
  const handleCreateBot = async () => {
    if (!newBot.name || !newBot.code) {
      toast.error('Bot name and code are required');
      return;
    }

    try {
      setLoading(true);
      const bot = {
        ...newBot,
        status: 'stopped',
      };

      await CustomBotService.createBot(bot);
      await loadBots(); // Refresh the list
      setShowCreateModal(false);
      resetNewBot();
      toast.success('Custom bot created successfully!');
    } catch (error) {
      console.error('Error creating bot:', error);
      toast.error('Failed to create bot');
    } finally {
      setLoading(false);
    }
  };

  // Delete bot
  const handleDeleteBot = async (botId) => {
    if (window.confirm('Are you sure you want to delete this bot?')) {
      try {
        setLoading(true);
        await CustomBotService.deleteBot(botId);
        await loadBots(); // Refresh the list
        toast.success('Bot deleted successfully');
      } catch (error) {
        console.error('Error deleting bot:', error);
        toast.error('Failed to delete bot');
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle bot status
  const handleToggleBot = async (botId) => {
    const bot = customBots.find((b) => b.id === botId);
    if (!bot) return;

    try {
      setLoading(true);
      if (bot.status === 'running') {
        await CustomBotService.stopBot(botId);
        toast.info(`Bot "${bot.name}" stopped`);
      } else {
        await CustomBotService.startBot(botId);
        toast.success(`Bot "${bot.name}" started`);
      }
      await loadBots(); // Refresh the list
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast.error(
        `Failed to ${bot.status === 'running' ? 'stop' : 'start'} bot`
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit bot
  const handleEditBot = (bot) => {
    setEditingBot(bot);
    setNewBot(bot);
    setShowCreateModal(true);
  };

  // Update existing bot
  const handleUpdateBot = async () => {
    if (!newBot.name || !newBot.code) {
      toast.error('Bot name and code are required');
      return;
    }

    try {
      setLoading(true);
      await CustomBotService.updateBot(editingBot.id, newBot);
      await loadBots(); // Refresh the list
      setShowCreateModal(false);
      setEditingBot(null);
      resetNewBot();
      toast.success('Bot updated successfully!');
    } catch (error) {
      console.error('Error updating bot:', error);
      toast.error('Failed to update bot');
    } finally {
      setLoading(false);
    }
  };

  const resetNewBot = () => {
    setNewBot({
      name: '',
      description: '',
      code: '',
      enabled: false,
      instruments: [],
      riskLevel: 'medium',
      executionInterval: 5,
      trailingStopType: 'none',
      trailingStopPips: 20,
    });
  };

  // Get template by ID from loaded templates
  const getTemplateById = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    return template ? template.code : `// Loading template...`;
  };

  // Get template options for dropdown
  const getTemplateOptions = () => {
    if (templates.length === 0) {
      return [
        {
          value: 'loading',
          label: 'Loading templates...',
          description: 'Loading templates...',
        },
      ];
    }

    return templates.map((template) => ({
      value: template.id,
      label: template.name,
      description: template.description,
    }));
  };

  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Get template descriptions for UI
  const getTemplateDescription = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    return template ? template.description : 'Loading template description...';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Custom Trading Bots</h2>
          <p className='text-gray-400'>
            Create and manage your custom trading algorithms
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
          <span>+</span>
          Create Bot
        </button>
      </div>

      {/* Bot List */}
      <div className='grid gap-6'>
        {loading ? (
          <div className='bg-[#232a4d] p-8 rounded-lg text-center'>
            <div className='text-6xl mb-4'>⏳</div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Loading Bots...
            </h3>
            <p className='text-gray-400'>Fetching your custom trading bots</p>
          </div>
        ) : customBots.length === 0 ? (
          <div className='bg-[#232a4d] p-8 rounded-lg text-center'>
            <div className='text-6xl mb-4'>🤖</div>
            <h3 className='text-xl font-bold text-white mb-2'>
              No Custom Bots Yet
            </h3>
            <p className='text-gray-400 mb-4'>
              Create your first custom trading bot to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg'>
              Create Your First Bot
            </button>
          </div>
        ) : (
          customBots.map((bot) => (
            <div key={bot.id} className='bg-[#232a4d] p-6 rounded-lg'>
              <div className='flex justify-between items-start mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-xl font-bold text-white'>{bot.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.status === 'running'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                      {bot.status}
                    </span>
                  </div>
                  <p className='text-gray-400 mb-3'>{bot.description}</p>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    <span className='text-sm text-gray-500'>Instruments:</span>
                    {bot.instruments.map((instrument) => (
                      <span
                        key={instrument}
                        className='bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs'>
                        {instrument.replace('_', '/')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handleToggleBot(bot.id)}
                    disabled={loading}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      bot.status === 'running'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading
                      ? '...'
                      : bot.status === 'running'
                      ? 'Stop'
                      : 'Start'}
                  </button>
                  <button
                    onClick={() => handleEditBot(bot)}
                    disabled={loading}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBot(bot.id)}
                    disabled={loading}
                    className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    {loading ? '...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className='grid grid-cols-4 gap-4 pt-4 border-t border-gray-700'>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance?.totalTrades ?? bot.total_trades ?? 0}
                  </div>
                  <div className='text-sm text-gray-400'>Total Trades</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {(bot.performance?.winRate ?? bot.win_rate ?? 0).toFixed(1)}
                    %
                  </div>
                  <div className='text-sm text-gray-400'>Win Rate</div>
                </div>
                <div className='text-center'>
                  <div
                    className={`text-lg font-bold ${
                      (bot.performance?.totalPnL ?? bot.total_pnl ?? 0) >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                    {(bot.performance?.totalPnL ?? bot.total_pnl ?? 0) >= 0
                      ? '+'
                      : ''}
                    {(bot.performance?.totalPnL ?? bot.total_pnl ?? 0).toFixed(
                      2
                    )}
                    %
                  </div>
                  <div className='text-sm text-gray-400'>Total P&L</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance?.lastRun ?? bot.last_run
                      ? new Date(
                          bot.performance?.lastRun ?? bot.last_run
                        ).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <div className='text-sm text-gray-400'>Last Run</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Bot Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-[#232a4d] p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-white'>
                {editingBot ? 'Edit Bot' : 'Create New Bot'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingBot(null);
                  resetNewBot();
                }}
                className='text-gray-400 hover:text-gray-300'>
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              {/* Bot Name */}
              <div>
                <label className='block text-white mb-2'>Bot Name</label>
                <input
                  type='text'
                  value={newBot.name}
                  onChange={(e) =>
                    setNewBot({ ...newBot, name: e.target.value })
                  }
                  className='w-full bg-gray-700 text-white p-2 rounded'
                  placeholder='Enter bot name'
                />
              </div>

              {/* Description */}
              <div>
                <label className='block text-white mb-2'>Description</label>
                <textarea
                  value={newBot.description}
                  onChange={(e) =>
                    setNewBot({ ...newBot, description: e.target.value })
                  }
                  className='w-full bg-gray-700 text-white p-2 rounded h-20'
                  placeholder='Describe your bot strategy'
                />
              </div>

              {/* Instruments */}
              <div>
                <label className='block text-white mb-2'>
                  Trading Instruments
                </label>
                <div className='grid grid-cols-5 gap-2'>
                  {availableInstruments.map((instrument) => (
                    <label
                      key={instrument}
                      className='flex items-center gap-2 text-white'>
                      <input
                        type='checkbox'
                        checked={newBot.instruments.includes(instrument)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewBot({
                              ...newBot,
                              instruments: [...newBot.instruments, instrument],
                            });
                          } else {
                            setNewBot({
                              ...newBot,
                              instruments: newBot.instruments.filter(
                                (i) => i !== instrument
                              ),
                            });
                          }
                        }}
                        className='rounded'
                      />
                      <span className='text-sm'>
                        {instrument.replace('_', '/')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className='block text-white mb-2'>Risk Level</label>
                <select
                  value={newBot.riskLevel}
                  onChange={(e) =>
                    setNewBot({ ...newBot, riskLevel: e.target.value })
                  }
                  className='w-full bg-gray-700 text-white p-2 rounded'>
                  <option value='low'>Low (0.5% per trade)</option>
                  <option value='medium'>Medium (1% per trade)</option>
                  <option value='high'>High (2% per trade)</option>
                </select>
              </div>

              {/* Execution Settings */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-white mb-2'>
                    Check Interval (minutes)
                  </label>
                  <select
                    value={newBot.executionInterval}
                    onChange={(e) =>
                      setNewBot({
                        ...newBot,
                        executionInterval: parseInt(e.target.value),
                      })
                    }
                    className='w-full bg-gray-700 text-white p-2 rounded'>
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
                <div>
                  <label className='block text-white mb-2'>
                    Trailing Stop Type
                  </label>
                  <select
                    value={newBot.trailingStopType}
                    onChange={(e) =>
                      setNewBot({
                        ...newBot,
                        trailingStopType: e.target.value,
                      })
                    }
                    className='w-full bg-gray-700 text-white p-2 rounded'>
                    <option value='none'>
                      None (Custom Exit Logic or Close Manually)
                    </option>
                    <option value='fixed_pips'>Fixed Pip Distance</option>
                  </select>
                  <p className='text-xs text-gray-400 mt-1'>
                    {newBot.trailingStopType === 'none'
                      ? 'Implement custom exit logic in your code'
                      : 'Automatic trailing stop at fixed pip distance'}
                  </p>
                </div>
              </div>

              {/* Pip Distance for Fixed Trailing Stop */}
              {newBot.trailingStopType === 'fixed_pips' && (
                <div>
                  <label className='block text-white mb-2'>
                    Trailing Stop Distance (pips)
                  </label>
                  <input
                    type='number'
                    value={newBot.trailingStopPips}
                    onChange={(e) =>
                      setNewBot({
                        ...newBot,
                        trailingStopPips: parseInt(e.target.value),
                      })
                    }
                    className='w-full bg-gray-700 text-white p-2 rounded'
                    min='5'
                    max='200'
                    step='5'
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    Position size will be calculated based on risk% and pip
                    distance
                  </p>
                </div>
              )}

              {/* Code Editor */}
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <label className='block text-white'>Bot Code</label>
                  <div className='flex items-center gap-2'>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className='bg-gray-700 text-white px-2 py-1 rounded text-sm'
                      disabled={loadingTemplates}>
                      {getTemplateOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        setNewBot({
                          ...newBot,
                          code: getTemplateById(selectedTemplate),
                        })
                      }
                      disabled={loadingTemplates}
                      className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50'>
                      {loadingTemplates ? 'Loading...' : 'Load Template'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={newBot.code}
                  onChange={(e) =>
                    setNewBot({ ...newBot, code: e.target.value })
                  }
                  className='w-full bg-gray-800 text-white p-4 rounded font-mono text-sm h-80'
                  placeholder='Enter your bot code here...'
                />
                <div className='text-xs text-gray-400 mt-2'>
                  {loadingTemplates ? (
                    <p>⏳ Loading templates...</p>
                  ) : templates.length > 0 ? (
                    <div>
                      <p>
                        <strong>💡 Selected Template:</strong>
                      </p>
                      <p className='mt-1'>
                        {getTemplateDescription(selectedTemplate)}
                      </p>
                      <br />
                      <p>
                        <strong>🔄 Bot Lifecycle:</strong> Signal detection →
                        Position entry → Monitoring → Exit conditions → Manual
                        control → Overview tab → Continue until stopped
                      </p>
                    </div>
                  ) : (
                    <p>
                      ❌ No templates available. Please check your connection.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-4 pt-4'>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBot(null);
                    resetNewBot();
                  }}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded'>
                  Cancel
                </button>
                <button
                  onClick={editingBot ? handleUpdateBot : handleCreateBot}
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                  {loading
                    ? 'Please wait...'
                    : editingBot
                    ? 'Update Bot'
                    : 'Create Bot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingBots;
