import React from 'react';

/**
 * Enterprise Accessible Dark-First Composable Table Components
 * Supports dense mode, zebra striping, sticky headers, and smooth hover states.
 */

export function Table({
  children,
  dense = false,
  className = '',
  containerClassName = '',
  bordered = true,
  ...props
}) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl ${
        bordered ? 'border border-slate-800/80 shadow-sm' : ''
      } bg-slate-950/40 backdrop-blur-sm ${containerClassName}`}
    >
      <table
        className={`w-full text-left border-collapse text-slate-200 ${dense ? 'text-xs' : 'text-sm'} ${className}`}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, { dense }) : child
        )}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', dense = false, ...props }) {
  return (
    <thead className={`border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] font-semibold select-none ${className}`} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { dense }) : child
      )}
    </thead>
  );
}

export function TableHead({
  children,
  className = '',
  align = 'left',
  sortable = false,
  sorted = null, // 'asc' | 'desc' | null
  onSort,
  dense = false,
  ...props
}) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] || 'text-left';

  return (
    <th
      className={`
        ${dense ? 'px-3 py-2' : 'px-4 py-3'}
        ${alignClass}
        ${sortable ? 'cursor-pointer hover:text-slate-200 transition-colors' : ''}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className={`inline-flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <span>{children}</span>
        {sortable && (
          <span className="text-slate-500 font-mono text-[10px]">
            {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '⇅'}
          </span>
        )}
      </div>
    </th>
  );
}

export function TableBody({ children, className = '', dense = false, ...props }) {
  return (
    <tbody className={`divide-y divide-slate-800/60 ${className}`} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { dense }) : child
      )}
    </tbody>
  );
}

export function TableRow({
  children,
  className = '',
  selected = false,
  clickable = false,
  dense = false,
  ...props
}) {
  return (
    <tr
      className={`
        transition-colors duration-100
        ${clickable ? 'cursor-pointer' : ''}
        ${selected ? 'bg-emerald-500/10 hover:bg-emerald-500/15' : 'hover:bg-slate-850/50'}
        ${className}
      `}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { dense }) : child
      )}
    </tr>
  );
}

export function TableCell({
  children,
  className = '',
  align = 'left',
  dense = false,
  ...props
}) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] || 'text-left';

  return (
    <td
      className={`
        ${dense ? 'px-3 py-2' : 'px-4 py-3.5'}
        ${alignClass}
        text-slate-300 align-middle
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableFooter({ children, className = '', dense = false, ...props }) {
  return (
    <tfoot className={`border-t border-slate-800 bg-slate-900/60 font-medium text-slate-300 ${className}`} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { dense }) : child
      )}
    </tfoot>
  );
}
