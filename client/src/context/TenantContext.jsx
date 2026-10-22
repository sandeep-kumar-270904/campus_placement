import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import collegeService from '../services/collegeService';

export const TenantContext = createContext();

const DEFAULT_BRANDING = {
  primaryColor: '#00ED64',
  accentColor: '#00684A',
  darkBg: '#001E2B',
  logoUrl: '',
};

const DEFAULT_FEATURE_FLAGS = {
  atsMatcher: true,
  prepHub: true,
  publicPortfolio: true,
  interviewScheduler: true,
  alumniNetwork: true,
};

const DEFAULT_GRADING_SYSTEM = {
  scale: '10-point',
  minPassCgpa: 4.0,
};

export const TenantProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [activeCollege, setActiveCollege] = useState(() => {
    const saved = localStorage.getItem('active_college');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  // Sync tenant when user signs in or changes
  useEffect(() => {
    if (user?.college) {
      setActiveCollege(user.college);
      localStorage.setItem('active_college', JSON.stringify(user.college));
      if (user.college._id) {
        localStorage.setItem('selectedCollegeId', user.college._id);
      }
    } else if (user?.role === 'superadmin') {
      // Super Admin: retain existing selection or null
      const savedId = localStorage.getItem('selectedCollegeId');
      if (savedId && !activeCollege) {
        collegeService.getCollegeById(savedId).then((col) => {
          setActiveCollege(col);
        }).catch(() => {
          localStorage.removeItem('selectedCollegeId');
          localStorage.removeItem('active_college');
        });
      }
    } else if (!user) {
      // When logged out, check if a subdomain or stored public college was set
      const saved = localStorage.getItem('active_college');
      if (saved) {
        setActiveCollege(JSON.parse(saved));
      }
    }
  }, [user]);

  // Dynamically inject CSS branding tokens into DOM root
  useEffect(() => {
    const branding = activeCollege?.branding || DEFAULT_BRANDING;
    const root = document.documentElement;

    const primary = branding.primaryColor || DEFAULT_BRANDING.primaryColor;
    const accent = branding.accentColor || DEFAULT_BRANDING.accentColor;
    const bg = branding.darkBg || DEFAULT_BRANDING.darkBg;

    root.style.setProperty('--college-primary', primary);
    root.style.setProperty('--college-accent', accent);
    root.style.setProperty('--college-bg', bg);
    root.style.setProperty('--college-glow', `${primary}33`);
  }, [activeCollege]);

  const branding = useMemo(() => {
    return {
      ...DEFAULT_BRANDING,
      ...(activeCollege?.branding || {}),
      name: activeCollege?.name || 'PLACEearly Institutional Campus OS',
      code: activeCollege?.code || 'DEFAULT',
      logo: activeCollege?.logo || activeCollege?.branding?.logoUrl || '',
    };
  }, [activeCollege]);

  const featureFlags = useMemo(() => {
    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...(activeCollege?.featureFlags || {}),
    };
  }, [activeCollege]);

  const gradingSystem = useMemo(() => {
    return {
      ...DEFAULT_GRADING_SYSTEM,
      ...(activeCollege?.gradingSystem || {}),
    };
  }, [activeCollege]);

  const isFeatureEnabled = (featureName) => {
    return featureFlags[featureName] ?? true;
  };

  const formatGrade = (score, type) => {
    if (score === null || score === undefined) return 'N/A';
    if (gradingSystem.scale === 'percentage' || type === 'Percentage') {
      return `${Number(score).toFixed(1)}%`;
    }
    return `${Number(score).toFixed(2)} CGPA`;
  };

  const switchTenant = (college) => {
    setActiveCollege(college);
    if (college) {
      localStorage.setItem('active_college', JSON.stringify(college));
      localStorage.setItem('selectedCollegeId', college._id);
    } else {
      localStorage.removeItem('active_college');
      localStorage.removeItem('selectedCollegeId');
    }
  };

  const refreshTenant = async (collegeId) => {
    const id = collegeId || activeCollege?._id;
    if (!id) return;
    try {
      setLoading(true);
      const updated = await collegeService.getCollegeById(id);
      setActiveCollege(updated);
      localStorage.setItem('active_college', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to refresh tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        activeCollege,
        tenant: activeCollege,
        branding,
        featureFlags,
        gradingSystem,
        policies: activeCollege?.policies || {},
        branches: activeCollege?.branches || [],
        isFeatureEnabled,
        formatGrade,
        switchTenant,
        refreshTenant,
        loading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;
