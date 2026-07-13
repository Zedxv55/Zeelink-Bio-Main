import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/**
 * ErrorBoundary — กันหน้าว่างแบบไม่มีอะไรเลย
 * ถ้าเกิด runtime error (เช่น component พัง) จะแสดงข้อความแทนการปล่อยหน้าขาวโหล่
 * และมีปุ่มโหลดใหม่ ไม่ทำให้แอปหายไปทั้งหมด
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[Zeelink] App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6 text-center"
          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className="max-w-md">
            <div className="text-5xl mb-4">🛠️</div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>
              ขออภัย เกิดข้อผิดพลาดชั่วคราว
            </h1>
            <p className="opacity-70 mb-5" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>
              หน้าเว็บเจอปัญหา กรุณากดโหลดใหม่ หรือลองใหม่อีกครั้งภายหลัง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full font-bold text-white"
              style={{ background: 'var(--orange)', fontFamily: "'IBM Plex Sans Thai', sans-serif" }}
            >
              โหลดหน้าใหม่
            </button>
            {this.state.message && (
              <p className="mt-5 text-xs opacity-50 break-words" style={{ fontFamily: 'monospace' }}>
                {this.state.message}
              </p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
