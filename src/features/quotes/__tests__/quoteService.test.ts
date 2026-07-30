import * as quoteService from '../services/quoteService';
import type { Quote } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as secureStore from '@/utils/secureStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@/utils/secureStore', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      }),
    },
  },
}));

const mockQuote: Quote = {
  id: 'test-quote-1',
  client: {
    kind: 'registered',
    client: {
      id: 'client-1',
      name: 'Client One',
      ruc: '1792456789001',
    },
  },
  items: [],
  status: 'Pendiente',
  createdAt: '2026-07-28T20:00:00Z',
  updatedAt: '2026-07-28T20:00:00Z',
};

describe('quoteService secure store tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveQuote stores quote in SecureStore and updates AsyncStorage index', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await quoteService.saveQuote(mockQuote);

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      'campomaq-quote-user-123-test-quote-1',
      JSON.stringify(mockQuote)
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'campomaq-quotes-ids-user-123',
      JSON.stringify(['test-quote-1'])
    );
  });

  test('getQuote retrieves quote from SecureStore', async () => {
    (secureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockQuote));

    const result = await quoteService.getQuote('test-quote-1');
    expect(result).toEqual(mockQuote);
    expect(secureStore.getItemAsync).toHaveBeenCalledWith(
      'campomaq-quote-user-123-test-quote-1'
    );
  });

  test('clearUserQuotes clears SecureStore items and AsyncStorage index', async () => {
    const userId = 'user-123';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['quote-1', 'quote-2']));

    await quoteService.clearUserQuotes(userId);

    expect(secureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('campomaq-quote-user-123-quote-1');
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('campomaq-quote-user-123-quote-2');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`campomaq-quotes-ids-${userId}`);
  });
});
