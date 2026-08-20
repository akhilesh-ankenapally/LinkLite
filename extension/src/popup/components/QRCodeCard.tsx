import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface QRCodeCardProps {
  url: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ url, showToast }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copiedImage, setCopiedImage] = useState(false);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `linklite-qr-${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showToast('QR Code downloaded as PNG', 'success');
  };

  const handleCopyImage = async () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to copy QR code image', 'error');
          return;
        }

        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedImage(true);
          showToast('QR Code image copied to clipboard!', 'success');
          setTimeout(() => setCopiedImage(false), 2000);
        } else {
          showToast('Image clipboard copying not supported on this browser', 'error');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy QR image error:', err);
      showToast('Could not copy image to clipboard', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* High-contrast QR Container */}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center"
      >
        <QRCodeCanvas
          value={url}
          size={180}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/icons/icon32.png',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-xs font-mono font-medium text-light-text dark:text-dark-text max-w-[260px] truncate select-all">
          {url}
        </p>
        <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
          Scan with mobile camera to test redirect
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full max-w-[280px]">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={handleCopyImage}
          leftIcon={copiedImage ? <Check className="w-3.5 h-3.5 text-light-success" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedImage ? 'Copied' : 'Copy Image'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleDownload}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Download
        </Button>
      </div>
    </div>
  );
};
