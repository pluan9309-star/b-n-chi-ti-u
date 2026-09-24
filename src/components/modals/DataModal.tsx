import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, FileSpreadsheet, Check, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose }) => {
  const { exportJSON, importJSON, exportCSV, resetData, transactions } = useFinance();
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const data = exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `so-thu-chi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Đã tải tệp sao lưu JSON thành công' });
  };

  const handleExportCSV = () => {
    const csvData = exportCSV();
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danh-sach-giao-dich-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Đã xuất tệp bảng tính CSV thành công' });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng dán mã JSON hợp lệ vào ô bên dưới' });
      return;
    }

    const success = importJSON(importText);
    if (success) {
      setStatusMsg({ type: 'success', text: 'Khôi phục dữ liệu từ JSON thành công!' });
      setImportText('');
    } else {
      setStatusMsg({ type: 'error', text: 'Tệp JSON không đúng định dạng. Vui lòng kiểm tra lại.' });
    }
  };

  const handleReset = () => {
    resetData();
    setShowConfirmReset(false);
    setStatusMsg({ type: 'success', text: 'Đã khôi phục dữ liệu mẫu mặc định ban đầu' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Quản lý Dữ liệu & Sao lưu</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Xuất dữ liệu ra máy tính
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Xuất CSV Excel</span>
                  <span className="text-[11px] text-slate-500">Danh sách {transactions.length} giao dịch</span>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Download size={18} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Sao lưu đầy đủ JSON</span>
                  <span className="text-[11px] text-slate-500">Bao gồm ví, ngân sách & mục tiêu</span>
                </div>
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Khôi phục từ tệp JSON
            </h4>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Dán nội dung JSON sao lưu vào đây..."
              rows={3}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Upload size={14} />
              <span>Khôi phục dữ liệu</span>
            </button>
          </div>

          {/* Reset to defaults */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Khôi phục dữ liệu mẫu
            </h4>
            {showConfirmReset ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-xs text-rose-800">
                  Thao tác này sẽ đặt lại toàn bộ giao dịch, ngân sách và mục tiêu về dữ liệu mẫu ban đầu.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md cursor-pointer"
                  >
                    Xác nhận đặt lại
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Đặt lại về dữ liệu ban đầu</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
