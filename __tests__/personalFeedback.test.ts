jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { personalBuild: true, feedbackApiUrl: 'https://example.test' } } },
}));

import { isFeedbackApiConfigured, submitFeedbackRequest } from '../src/services/feedbackApi';

test('personal build blocks feedback even if a service URL is configured', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch');
  try {
    expect(isFeedbackApiConfigured()).toBe(false);
    await expect(submitFeedbackRequest({ title: 'test', body: 'test', revenueCatUserId: null })).rejects.toThrow('not configured');
    expect(fetchSpy).not.toHaveBeenCalled();
  } finally { fetchSpy.mockRestore(); }
});
