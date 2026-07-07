'use client';

import { useState, useEffect } from 'react';
import { FEATURES } from './pricing-data';

export interface BusinessInfo {
  businessName: string;
  industry: string;
  businessDescription: string;
  currentWebsite: string;
  competitorWebsites: string;
  targetAudience: string;
  expectedMonthlyVisitors: string;
  expectedMonthlyOrders: string;
  logoAvailable: boolean;
  brandGuidelinesAvailable: boolean;
  preferredColors: string;
}

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  businessName: '',
  industry: '',
  businessDescription: '',
  currentWebsite: '',
  competitorWebsites: '',
  targetAudience: '',
  expectedMonthlyVisitors: '',
  expectedMonthlyOrders: '',
  logoAvailable: false,
  brandGuidelinesAvailable: false,
  preferredColors: ''
};

interface HistoryState {
  selectedIds: string[];
  customPages: string[];
}

export function useCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Business Details, Step 2: Features Scoping

  // Core state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customPages, setCustomPages] = useState<string[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);

  // Undo/Redo stacks
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Load initial data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('website_estimate_state_simplified');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.selectedIds) setSelectedIds(parsed.selectedIds);
        if (parsed.customPages) setCustomPages(parsed.customPages);
        if (parsed.businessInfo) setBusinessInfo(parsed.businessInfo);
      } else {
        // Seed base site default
        setSelectedIds(['base_site']);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        step,
        selectedIds,
        customPages,
        businessInfo
      };
      localStorage.setItem('website_estimate_state_simplified', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [step, selectedIds, customPages, businessInfo, isLoaded]);

  // Helper to commit current state to history before mutating
  const pushToHistory = (newSelected: string[], newPages: string[]) => {
    setPast((prev) => [...prev, { selectedIds, customPages }]);
    setFuture([]); // Clear redo stack on new action
    setSelectedIds(newSelected);
    setCustomPages(newPages);
  };

  const toggleFeature = (id: string) => {
    if (id === 'base_site') return; // Base site is mandatory

    let newSelected = [...selectedIds];
    if (newSelected.includes(id)) {
      newSelected = newSelected.filter((item) => item !== id);
      // Also recursively deselect any selected features that depend on this one
      const dependentIds = FEATURES.filter((f) => f.dependencies?.includes(id)).map((f) => f.id);
      newSelected = newSelected.filter((item) => !dependentIds.includes(item));
    } else {
      newSelected.push(id);
    }

    pushToHistory(newSelected, customPages);
  };

  const selectFeatureDirectly = (id: string) => {
    if (selectedIds.includes(id)) return;
    const newSelected = [...selectedIds, id];
    pushToHistory(newSelected, customPages);
  };

  const addCustomPage = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || customPages.includes(trimmed)) return;
    const newPages = [...customPages, trimmed];
    pushToHistory(selectedIds, newPages);
  };

  const removeCustomPage = (index: number) => {
    const newPages = customPages.filter((_, i) => i !== index);
    pushToHistory(selectedIds, newPages);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [{ selectedIds, customPages }, ...prev]);
    setSelectedIds(previous.selectedIds);
    setCustomPages(previous.customPages);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, { selectedIds, customPages }]);
    setSelectedIds(next.selectedIds);
    setCustomPages(next.customPages);
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to clear your current progress?')) {
      setPast([]);
      setFuture([]);
      setSelectedIds(['base_site']);
      setCustomPages([]);
      setBusinessInfo(DEFAULT_BUSINESS_INFO);
      setStep(1);
    }
  };

  return {
    isLoaded,
    step,
    setStep,
    selectedIds,
    setSelectedIds,
    customPages,
    addCustomPage,
    removeCustomPage,
    businessInfo,
    setBusinessInfo,
    toggleFeature,
    selectFeatureDirectly,
    undo,
    redo,
    resetAll,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
