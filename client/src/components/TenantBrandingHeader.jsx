import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';

const TenantBrandingHeader = () => {
  const { user } = useContext(AuthContext);
  const { tenant, branding } = useTenant();

  if (!user && !tenant) return null;

  const collegeName = tenant?.name || branding.name || 'PLACEearly Central';
  const collegeCode = tenant?.code || branding.code;
  const logoUrl = tenant?.logo || branding.logo;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={collegeName}
            className="w-6 h-6 rounded-md object-contain bg-white/10 p-0.5 border border-slate-700"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-slate-950 text-[10px]"
            style={{ backgroundColor: branding.primaryColor || '#00ED64' }}
          >
            {collegeCode ? collegeCode.slice(0, 2) : 'PE'}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide truncate max-w-[260px] sm:max-w-md">
            {collegeName}
          </span>
          {collegeCode && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${branding.primaryColor || '#00ED64'}22`,
                color: branding.primaryColor || '#00ED64',
                border: `1px solid ${branding.primaryColor || '#00ED64'}44`,
              }}
            >
              {collegeCode}
            </span>
          )}
        </div>

        {tenant?.academicYearConfig?.currentYear && (
          <span className="hidden md:inline-block text-slate-400 font-mono text-[11px] border-l border-slate-700 pl-2">
            Season {tenant.academicYearConfig.currentYear}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user?.role === 'superadmin' && (
          <Link
            to="/superadmin"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 hover:bg-purple-900 transition font-medium text-[11px]"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            Super Admin Console
          </Link>
        )}

        {(user?.role === 'tpo' || user?.role === 'admin' || user?.role === 'superadmin') && (
          <Link
            to="/college/settings"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700/80 transition text-[11px]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            College Config
          </Link>
        )}
      </div>
    </div>
  );
};

export default TenantBrandingHeader;
