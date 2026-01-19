/**
 * نظام التحقق من صحة البيانات المدخلة - الكاشير
 * قهوة الشام
 */

class CashierValidation {
    /**
     * التحقق من رقم الطاولة
     */
    static validateTableNumber(tableNumber) {
        if (!tableNumber || tableNumber.trim() === '') {
            return { valid: true, message: null }; // اختياري
        }
        
        const trimmed = tableNumber.trim();
        
        // التحقق من الطول
        if (trimmed.length > 50) {
            return {
                valid: false,
                message: 'رقم الطاولة طويل جداً (الحد الأقصى 50 حرف)'
            };
        }
        
        // التحقق من الأحرف الخاصة الخطيرة
        const dangerousChars = /[<>\"'&]/;
        if (dangerousChars.test(trimmed)) {
            return {
                valid: false,
                message: 'رقم الطاولة يحتوي على أحرف غير مسموحة'
            };
        }
        
        return { valid: true, message: null };
    }
    
    /**
     * التحقق من نسبة الخصم
     */
    static validateDiscount(percent) {
        if (percent === null || percent === undefined || percent === '') {
            return { valid: true, message: null }; // 0% مسموح
        }
        
        const num = parseFloat(percent);
        
        if (isNaN(num)) {
            return {
                valid: false,
                message: 'نسبة الخصم يجب أن تكون رقماً'
            };
        }
        
        if (num < 0) {
            return {
                valid: false,
                message: 'نسبة الخصم لا يمكن أن تكون سالبة'
            };
        }
        
        if (num > 100) {
            return {
                valid: false,
                message: 'نسبة الخصم لا يمكن أن تتجاوز 100%'
            };
        }
        
        return { valid: true, message: null };
    }
    
    /**
     * التحقق من الكمية
     */
    static validateQuantity(quantity) {
        const num = parseInt(quantity);
        
        if (isNaN(num)) {
            return {
                valid: false,
                message: 'الكمية يجب أن تكون رقماً'
            };
        }
        
        if (num < 1) {
            return {
                valid: false,
                message: 'الكمية يجب أن تكون على الأقل 1'
            };
        }
        
        if (num > 999) {
            return {
                valid: false,
                message: 'الكمية لا يمكن أن تتجاوز 999'
            };
        }
        
        return { valid: true, message: null };
    }
    
    /**
     * التحقق من المبلغ النقدي
     */
    static validateCashAmount(amount) {
        if (!amount || amount === '') {
            return {
                valid: false,
                message: 'يرجى إدخال المبلغ النقدي'
            };
        }
        
        const num = parseFloat(amount);
        
        if (isNaN(num)) {
            return {
                valid: false,
                message: 'المبلغ يجب أن يكون رقماً'
            };
        }
        
        if (num < 0) {
            return {
                valid: false,
                message: 'المبلغ لا يمكن أن يكون سالباً'
            };
        }
        
        if (num > 999999) {
            return {
                valid: false,
                message: 'المبلغ كبير جداً'
            };
        }
        
        return { valid: true, message: null };
    }
    
    /**
     * التحقق من السلة قبل الدفع
     */
    static validateCartBeforePayment(cart) {
        if (!cart || cart.length === 0) {
            return {
                valid: false,
                message: 'السلة فارغة. يرجى إضافة منتجات قبل الدفع'
            };
        }
        
        // التحقق من كل عنصر في السلة
        for (const item of cart) {
            // التحقق من السعر
            const price = parseFloat(item.price);
            if (isNaN(price) || price < 0) {
                return {
                    valid: false,
                    message: `سعر "${item.name}" غير صحيح`
                };
            }
            
            // التحقق من الكمية
            const qtyValidation = this.validateQuantity(item.quantity);
            if (!qtyValidation.valid) {
                return {
                    valid: false,
                    message: `كمية "${item.name}" غير صحيحة: ${qtyValidation.message}`
                };
            }
        }
        
        return { valid: true, message: null };
    }
    
    /**
     * التحقق من بيانات الإغلاق اليومي
     */
    static validateDailyClosing(actualCash, notes) {
        const cashValidation = this.validateCashAmount(actualCash);
        if (!cashValidation.valid) {
            return cashValidation;
        }
        
        // التحقق من الملاحظات
        if (notes && notes.length > 500) {
            return {
                valid: false,
                message: 'الملاحظات طويلة جداً (الحد الأقصى 500 حرف)'
            };
        }
        
        return { valid: true, message: null };
    }
    
    /**
     * عرض رسالة خطأ
     */
    static showError(inputElement, message) {
        if (!inputElement) return;
        
        // إضافة class للخطأ
        inputElement.classList.add('input-error');
        inputElement.classList.remove('input-success');
        
        // إزالة رسالة الخطأ السابقة
        const existingError = inputElement.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // إضافة رسالة الخطأ الجديدة
        if (message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            inputElement.parentElement.appendChild(errorDiv);
        }
        
        // إزالة الخطأ بعد 5 ثواني
        setTimeout(() => {
            inputElement.classList.remove('input-error');
            const errorMsg = inputElement.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }, 5000);
    }
    
    /**
     * إزالة رسالة الخطأ
     */
    static clearError(inputElement) {
        if (!inputElement) return;
        
        inputElement.classList.remove('input-error');
        inputElement.classList.add('input-success');
        
        const errorMsg = inputElement.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
        
        // إزالة class النجاح بعد ثانية
        setTimeout(() => {
            inputElement.classList.remove('input-success');
        }, 1000);
    }
    
    /**
     * التحقق من الباركود
     */
    static validateBarcode(barcode) {
        if (!barcode || barcode.trim() === '') {
            return {
                valid: false,
                message: 'يرجى إدخال الباركود'
            };
        }
        
        const trimmed = barcode.trim();
        
        if (trimmed.length < 3) {
            return {
                valid: false,
                message: 'الباركود قصير جداً'
            };
        }
        
        if (trimmed.length > 50) {
            return {
                valid: false,
                message: 'الباركود طويل جداً'
            };
        }
        
        return { valid: true, message: null };
    }
}

// تصدير للاستخدام العام
window.CashierValidation = CashierValidation;





