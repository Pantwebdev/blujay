/**
 * Professional Toast Notification System
 * Blujay Technologies - Community Portal
 * Mobile & Desktop Responsive
 */

// Immediately create toast container (runs as soon as script loads)
if (typeof window !== 'undefined') {
    // Function to ensure container exists
    function ensureToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            // Try to append to body, or wait for it
            if (document.body) {
                document.body.appendChild(container);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    document.body.appendChild(container);
                });
            }
        }
    }
    
    // Try to create container immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureToastContainer);
    } else {
        ensureToastContainer();
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
window.showToast = function(message, type = 'info', duration = 4000) {
    // Ensure container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;
    
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.remove('toast-enter'), 10);
    
    // Auto dismiss
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Show inline error message below a form field
 * @param {string} fieldId - ID of the input field
 * @param {string} message - Error message
 */
window.showFieldError = function(fieldId, message) {
    window.clearFieldError(fieldId);
    
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Add error class to field
    field.classList.add('field-error');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.id = `${fieldId}-error`;
    
    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    
    // Scroll to field
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field.focus();
};

/**
 * Clear inline error message
 * @param {string} fieldId - ID of the input field
 */
window.clearFieldError = function(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('field-error');
    }
    
    const errorMsg = document.getElementById(`${fieldId}-error`);
    if (errorMsg) {
        errorMsg.remove();
    }
};

/**
 * Clear all field errors on a form
 * @param {string} formId - ID of the form
 */
window.clearAllFieldErrors = function(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.querySelectorAll('.field-error').forEach(field => {
        field.classList.remove('field-error');
    });
    
    form.querySelectorAll('.field-error-message').forEach(msg => {
        msg.remove();
    });
};

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    /* Toast Container */
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
    }
    
    /* Toast */
    .toast {
        background: white;
        border-radius: 8px;
        padding: 16px;
        min-width: 320px;
        max-width: 420px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        pointer-events: auto;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 4px solid;
    }
    
    /* Toast Types */
    .toast-success {
        border-left-color: #10B981;
        background: #F0FDF4;
    }
    
    .toast-error {
        border-left-color: #EF4444;
        background: #FEF2F2;
    }
    
    .toast-warning {
        border-left-color: #F59E0B;
        background: #FFFBEB;
    }
    
    .toast-info {
        border-left-color: #0057A0;
        background: #EFF6FF;
    }
    
    /* Toast Icon */
    .toast-icon {
        font-size: 20px;
        flex-shrink: 0;
    }
    
    .toast-success .toast-icon {
        color: #10B981;
    }
    
    .toast-error .toast-icon {
        color: #EF4444;
    }
    
    .toast-warning .toast-icon {
        color: #F59E0B;
    }
    
    .toast-info .toast-icon {
        color: #0057A0;
    }
    
    /* Toast Message */
    .toast-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        color: #1F2937;
        font-weight: 500;
    }
    
    /* Toast Close Button */
    .toast-close {
        background: none;
        border: none;
        color: #6B7280;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
    }
    
    .toast-close:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #1F2937;
    }
    
    /* Toast Animations */
    .toast-enter {
        transform: translateX(400px);
        opacity: 0;
    }
    
    .toast-exit {
        transform: translateX(400px);
        opacity: 0;
    }
    
    /* Field Error Styling */
    .field-error {
        border-color: #EF4444 !important;
        background-color: #FEF2F2 !important;
    }
    
    .field-error:focus {
        outline: none !important;
        border-color: #DC2626 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .field-error-message {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        font-size: 13px;
        color: #DC2626;
        font-weight: 500;
        animation: slideDown 0.2s ease-out;
    }
    
    .field-error-message i {
        font-size: 14px;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        .toast-container {
            top: 10px;
            right: 10px;
            left: 10px;
        }
        
        .toast {
            min-width: auto;
            width: 100%;
            max-width: none;
            padding: 14px;
        }
        
        .toast-message {
            font-size: 13px;
        }
        
        .toast-icon {
            font-size: 18px;
        }
        
        .toast-enter, .toast-exit {
            transform: translateY(-100px);
        }
    }
    
    @media (max-width: 480px) {
        .toast {
            padding: 12px;
        }
        
        .toast-message {
            font-size: 12px;
        }
        
        .field-error-message {
            font-size: 12px;
        }
    }
`;
document.head.appendChild(style);
