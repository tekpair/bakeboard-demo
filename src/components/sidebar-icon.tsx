const paths = {
  overview:
    'M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm11 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Zm11 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z',
  board:
    'M9 2h6l1 2h2a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h2l1-2Zm1 2v2h4V4h-4ZM7 10v2h2v-2H7Zm4 0v2h6v-2h-6Zm-4 5v2h2v-2H7Zm4 0v2h6v-2h-6Z',
  calendar:
    'M6 2h2v3h8V2h2v3h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h1V2Zm-1 7v2h14V9H5Zm1 5v2h2v-2H6Zm5 0v2h2v-2h-2Zm5 0v2h2v-2h-2ZM6 18v2h2v-2H6Zm5 0v2h2v-2h-2Z',
  library: 'M3 3h4v18H3V3Zm6 0h4v18H9V3Zm6 1 4-1 4 17-4 1-4-17Z',
  tasks:
    'm2 6 2-2 2 2 4-4 2 2-6 6-4-4Zm11-2h9v3h-9V4ZM2 15l2-2 2 2 4-4 2 2-6 6-4-4Zm11-2h9v3h-9v-3Zm0 6h9v3h-9v-3Z',
  staff:
    'M8 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm10 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8 12c4 0 7 3 7 7v3H1v-3c0-4 3-7 7-7Zm10 0c3 0 5 3 5 6v4h-6v-3c0-2.6-.8-4.8-2.2-6.5 1-.3 2.1-.5 3.2-.5Z',
  settings:
    'M10 1h4l.7 3.1 2 .9 2.7-1.7 2.8 2.8-1.7 2.7.9 2L24 12v4l-3.1.7-.9 2 1.7 2.7-2.8 2.8-2.7-1.7-2 .9L13 26H9l-.7-3.1-2-.9-2.7 1.7L.8 20.9l1.7-2.7-.9-2L-1 15v-4l3.1-.7.9-2L1.3 5.6l2.8-2.8 2.7 1.7 2-.9L10 1Zm2 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
  help: 'M2 4c3-1 6-.5 9 1v17c-3-1.5-6-2-9-1V4Zm11 1c3-1.5 6-2 9-1v17c-3-1-6-.5-9 1V5Z',
  back: 'm10 3 2 2-5.5 5.5H23v3H6.5L12 19l-2 2L0 12 10 3Z',
  reset:
    'M12 2a10 10 0 1 1-9.8 12H5a7 7 0 1 0 1.9-7L10 10H1V1l3.7 3.7A10 10 0 0 1 12 2Z',
  collapse:
    'M3 2h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm6 3v14h11V5H9Zm6 2 2 2-3 3 3 3-2 2-5-5 5-5Z',
  expand:
    'M3 2h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm6 3v14h11V5H9Zm3 2 5 5-5 5-2-2 3-3-3-3 2-2Z',
  plus: 'M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2Z',
  sparkles:
    'm13 1 3.5 7.5L24 12l-7.5 3.5L13 23l-3.5-7.5L2 12l7.5-3.5L13 1ZM4 1l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z',
  upRight: 'M5 3h16v16h-3V8L5 21l-2-2L16 6H5V3Z',
  menu: 'M2 4h20v3H2V4Zm0 7h20v3H2v-3Zm0 7h20v3H2v-3Z',
  close: 'm5 3 7 7 7-7 2 2-7 7 7 7-2 2-7-7-7 7-2-2 7-7-7-7 2-2Z',
};

export function SidebarIcon({
  name,
  size = 18,
}: {
  name: keyof typeof paths;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={name === 'settings' ? '-2 0 28 28' : '0 0 24 24'}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      data-sidebar-icon={name}
    >
      <path d={paths[name]} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
