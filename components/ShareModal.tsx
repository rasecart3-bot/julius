import React, { useState, useEffect } from 'react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShareUrl(window.location.href);
        }
    }, [isOpen]);
    
    if (!isOpen) {
        return null;
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}&qzone=1&bgcolor=1e293b&color=f8fafc`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-surface rounded-lg shadow-2xl p-6 w-full max-w-sm m-4 text-center space-y-4 transform transition-all border border-gray-700 animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-accent">Compartir Simulador</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <p className="text-text-secondary">Escanea el código QR o copia el enlace para compartir esta aplicación.</p>

                <div>
                    <img src={qrCodeUrl} alt="Código QR para compartir" className="mx-auto rounded-md border-4 border-gray-700" />
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={shareUrl} 
                        readOnly 
                        className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-sm text-gray-300 pr-24"
                    />
                    <button 
                        onClick={handleCopy} 
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent text-white font-semibold py-1 px-3 rounded-md hover:bg-secondary transition-colors text-sm shadow-md"
                    >
                        {isCopied ? '¡Copiado!' : 'Copiar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;