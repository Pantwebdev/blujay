/**
 * Professional Confirmation Modal System
 * Replaces browser confirm() dialogs with styled, accessible modals
 * Works on mobile and desktop with Blujay theme
 */

(function() {
    'use strict';
    
    // Create modal HTML - run immediately or on DOMContentLoaded
    function createConfirmationModal() {
        if (document.getElementById('confirmationModal')) {
            return; // Already exists
        }
        
        const modalHTML = `
            <div id="confirmationModal" class="confirmation-modal-overlay" style="display: none;">
                <div class="confirmation-modal-content">
                    <div class="confirmation-modal-header">
                        <i class="fas fa-question-circle confirmation-modal-icon"></i>
                    </div>
                    <div class="confirmation-modal-body">
                        <p id="confirmationMessage" class="confirmation-modal-message"></p>
                    </div>
                    <div class="confirmation-modal-footer">
                        <button id="confirmationCancelBtn" class="confirmation-btn confirmation-btn-cancel">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button id="confirmationConfirmBtn" class="confirmation-btn confirmation-btn-confirm">
                            <i class="fas fa-check"></i> Confirm
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        if (document.body) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }
    
    // Try to create immediately, or wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createConfirmationModal);
    } else {
        createConfirmationModal();
    }
    
    /**
     * Show confirmation modal and return a promise
     * @param {string} message - The confirmation message to display
     * @param {object} options - Optional configuration
     * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
     */
    window.showConfirmation = function(message, options = {}) {
        // Ensure modal exists
        if (!document.getElementById('confirmationModal')) {
            createConfirmationModal();
        }
        
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmationModal');
            const messageEl = document.getElementById('confirmationMessage');
            const confirmBtn = document.getElementById('confirmationConfirmBtn');
            const cancelBtn = document.getElementById('confirmationCancelBtn');
            
            if (!modal || !messageEl || !confirmBtn || !cancelBtn) {
                console.error('Confirmation modal elements not found!');
                resolve(false);
                return;
            }
            
            // Set message
            messageEl.textContent = message;
            
            // Customize button text if provided
            if (options.confirmText) {
                confirmBtn.innerHTML = `<i class="fas fa-check"></i> ${options.confirmText}`;
            } else {
                confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm';
            }
            
            if (options.cancelText) {
                cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${options.cancelText}`;
            } else {
                cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
            }
            
            // Show modal with animation
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Handle confirm
            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };
            
            // Handle cancel
            const handleCancel = () => {
                cleanup();
                resolve(false);
            };
            
            // Cleanup function
            const cleanup = () => {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 300);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                modal.removeEventListener('click', handleOutsideClick);
                document.removeEventListener('keydown', handleEscape);
            };
            
            // Handle click outside modal
            const handleOutsideClick = (e) => {
                if (e.target === modal) {
                    handleCancel();
                }
            };
            
            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                }
            };
            
            // Add event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            modal.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscape);
            
            // Focus confirm button for keyboard accessibility
            setTimeout(() => confirmBtn.focus(), 100);
        });
    };
})();

// Embedded CSS
const confirmationModalStyles = document.createElement('style');
confirmationModalStyles.textContent = `
    .confirmation-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .confirmation-modal-overlay.show {
        opacity: 1;
    }
    
    .confirmation-modal-content {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 480px;
        width: 100%;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }
    
    .confirmation-modal-overlay.show .confirmation-modal-content {
        transform: scale(1);
    }
    
    .confirmation-modal-header {
        background: linear-gradient(135deg, #0057A0 0%, #003d73 100%);
        padding: 24px;
        text-align: center;
    }
    
    .confirmation-modal-icon {
        font-size: 48px;
        color: white;
    }
    
    .confirmation-modal-body {
        padding: 32px 24px;
    }
    
    .confirmation-modal-message {
        font-size: 16px;
        line-height: 1.6;
        color: #2d3748;
        text-align: center;
        margin: 0;
        font-weight: 500;
    }
    
    .confirmation-modal-footer {
        display: flex;
        gap: 12px;
        padding: 0 24px 24px 24px;
    }
    
    .confirmation-btn {
        flex: 1;
        padding: 14px 24px;
        font-size: 15px;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: 'Inter', sans-serif;
    }
    
    .confirmation-btn:focus {
        outline: 3px solid rgba(0, 87, 160, 0.3);
        outline-offset: 2px;
    }
    
    .confirmation-btn-cancel {
        background: #e2e8f0;
        color: #475569;
    }
    
    .confirmation-btn-cancel:hover {
        background: #cbd5e1;
        transform: translateY(-1px);
    }
    
    .confirmation-btn-cancel:active {
        transform: translateY(0);
    }
    
    .confirmation-btn-confirm {
        background: linear-gradient(135deg, #0057A0 0%, #003d73 100%);
        color: white;
    }
    
    .confirmation-btn-confirm:hover {
        background: linear-gradient(135deg, #003d73 0%, #002952 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 87, 160, 0.3);
    }
    
    .confirmation-btn-confirm:active {
        transform: translateY(0);
    }
    
    /* Mobile responsive */
    @media (max-width: 480px) {
        .confirmation-modal-content {
            max-width: 100%;
            margin: 0 16px;
        }
        
        .confirmation-modal-header {
            padding: 20px;
        }
        
        .confirmation-modal-icon {
            font-size: 40px;
        }
        
        .confirmation-modal-body {
            padding: 24px 20px;
        }
        
        .confirmation-modal-message {
            font-size: 15px;
        }
        
        .confirmation-modal-footer {
            flex-direction: column;
            padding: 0 20px 20px 20px;
        }
        
        .confirmation-btn {
            padding: 12px 20px;
            font-size: 14px;
        }
    }
`;

document.head.appendChild(confirmationModalStyles);
