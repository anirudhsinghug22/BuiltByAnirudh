import { Feature, FeatureComplexity } from '@/types';
import { FEATURES } from './pricing-data';

export const CUSTOM_PAGE_MIN_COST = 5000;
export const CUSTOM_PAGE_MAX_COST = 10000;
export const CUSTOM_PAGE_DEV_HOURS = 6;

export interface CalculationResult {
  minCost: number;
  maxCost: number;
  devHours: number;
  qaHours: number;
  deploymentHours: number;
  totalHours: number;
  totalDays: number;
  complexity: FeatureComplexity;
  featureCount: number;
  integrationCount: number;
}

export function calculateEstimate(
  selectedIds: string[],
  customPagesCount: number
): CalculationResult {
  // Filter out any invalid selections, and always force the base website to be active
  let activeSelectedIds = [...selectedIds];
  if (!activeSelectedIds.includes('base_site')) {
    activeSelectedIds.unshift('base_site');
  }

  const selectedFeatures = FEATURES.filter((f) => activeSelectedIds.includes(f.id));

  // Compute baseline sums from selected features
  let minCost = selectedFeatures.reduce((sum, f) => sum + f.min_cost, 0);
  let maxCost = selectedFeatures.reduce((sum, f) => sum + f.max_cost, 0);
  let devHours = selectedFeatures.reduce((sum, f) => sum + f.dev_hours, 0);

  // Add custom pages cost
  if (customPagesCount > 0) {
    minCost += customPagesCount * CUSTOM_PAGE_MIN_COST;
    maxCost += customPagesCount * CUSTOM_PAGE_MAX_COST;
    devHours += customPagesCount * CUSTOM_PAGE_DEV_HOURS;
  }

  // Calculate QA & Deployment factors
  const qaHours = Math.round(devHours * 0.20);
  const deploymentHours = Math.round(devHours * 0.10);
  const totalHours = devHours + qaHours + deploymentHours;
  
  // Calculate timeline in days (starting at 22 days scaling up to 40 days (2 mo) for all features)
  const baseDays = 22;
  const maxDays = 40;
  const totalFeaturesCount = FEATURES.length - 1; // 17 features
  const activeFeaturesCount = selectedFeatures.filter(f => f.id !== 'base_site').length;
  const customPagesWeight = customPagesCount * 1.5; // each custom page adds 1.5 working days
  const featuresWeight = totalFeaturesCount > 0 ? (activeFeaturesCount / totalFeaturesCount) * (maxDays - baseDays) : 0;
  const calculatedDays = Math.round(baseDays + featuresWeight + customPagesWeight);
  const totalDays = Math.min(50, calculatedDays);

  // Complexity thresholds based on development hours
  let complexity: FeatureComplexity = 'low';
  if (totalHours > 80) {
    complexity = 'very_high';
  } else if (totalHours > 50) {
    complexity = 'high';
  } else if (totalHours > 30) {
    complexity = 'medium';
  }

  // Integrations count matches integrations-oriented features
  const integrationCategories = ['gateway', 'shipping', 'marketing', 'advanced'];
  const integrationCount = selectedFeatures.filter((f) =>
    integrationCategories.includes(f.category)
  ).length;

  return {
    minCost,
    maxCost,
    devHours,
    qaHours,
    deploymentHours,
    totalHours,
    totalDays,
    complexity,
    featureCount: selectedFeatures.length - 1 + customPagesCount, // exclude base setup from visible feature counts
    integrationCount
  };
}

export interface Recommendation {
  triggerId: string;
  triggerName: string;
  recommendedId: string;
  recommendedName: string;
  reason: string;
}

export function getMissingDependencies(selectedIds: string[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. If Online Payments ('pay_online') selected, suggest Add to Cart ('eco_cart')
  if (selectedIds.includes('pay_online') && !selectedIds.includes('eco_cart')) {
    const pay = FEATURES.find((f) => f.id === 'pay_online');
    const cart = FEATURES.find((f) => f.id === 'eco_cart');
    recommendations.push({
      triggerId: 'pay_online',
      triggerName: pay?.name || 'Online Payments',
      recommendedId: 'eco_cart',
      recommendedName: cart?.name || 'Add to Cart System',
      reason: 'Online payment systems require a shopping cart to consolidate product lists before checkout.'
    });
  }

  // 2. If Wishlist ('eco_wishlist') selected, suggest Customer Login ('chk_auth')
  if (selectedIds.includes('eco_wishlist') && !selectedIds.includes('chk_auth')) {
    const wish = FEATURES.find((f) => f.id === 'eco_wishlist');
    const auth = FEATURES.find((f) => f.id === 'chk_auth');
    recommendations.push({
      triggerId: 'eco_wishlist',
      triggerName: wish?.name || 'Wishlist',
      recommendedId: 'chk_auth',
      recommendedName: auth?.name || 'Customer Login / Signup',
      reason: 'Wishlist features require customer account profiles to save items across visits.'
    });
  }

  // 3. General dependency checking defined on feature models
  for (const id of selectedIds) {
    const feature = FEATURES.find((f) => f.id === id);
    if (!feature || !feature.dependencies) continue;

    for (const depId of feature.dependencies) {
      if (!selectedIds.includes(depId)) {
        const depFeature = FEATURES.find((f) => f.id === depId);
        recommendations.push({
          triggerId: id,
          triggerName: feature.name,
          recommendedId: depId,
          recommendedName: depFeature?.name || depId,
          reason: `Required dependency for implementing ${feature.name}.`
        });
      }
    }
  }

  // De-duplicate recommendations by recommendedId
  const seen = new Set<string>();
  return recommendations.filter((rec) => {
    if (seen.has(rec.recommendedId)) return false;
    seen.add(rec.recommendedId);
    return true;
  });
}
