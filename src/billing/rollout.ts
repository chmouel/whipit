import { getBillingDistribution, isNativeStoreChannel, isPersonalBuild, type DistributionChannel } from './distribution';
import type { DevicePreferences } from '../services/devicePreferences';

export function billingRolloutPolicy(
  channel: DistributionChannel | null,
  developerOptionsRequested: boolean,
  personalBuild = false,
) {
  const developerOptionsAvailable = !isNativeStoreChannel(channel);
  const developerOptionsEnabled = developerOptionsAvailable && developerOptionsRequested;
  return {
    developerOptionsAvailable,
    developerOptionsEnabled,
    billingEnabled: !(personalBuild && channel === null) && (!developerOptionsAvailable || developerOptionsEnabled),
  };
}

export function getBillingRolloutPolicy(developerOptionsRequested = false) {
  return billingRolloutPolicy(getBillingDistribution().channel, developerOptionsRequested, isPersonalBuild());
}

/** Ignore stored debug settings in native store builds without deleting preferences. */
export function applyDeveloperOptionsPolicy(
  preferences: DevicePreferences,
  developerOptionsAvailable: boolean,
): DevicePreferences {
  if (developerOptionsAvailable) return preferences;
  return {
    ...preferences,
    developerOptionsEnabled: false,
    terminal: { ...preferences.terminal, visualHints: false },
  };
}
