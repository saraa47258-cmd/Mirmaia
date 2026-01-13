/**
 * نظام الحساب الدقيق - Sham Coffee
 * يستخدم الحساب بالأعداد الصحيحة لتجنب أخطاء الفاصلة العائمة
 * الدقة: 3 خانات عشرية (للريال العماني)
 */

const PrecisionCalc = {
    // معامل التحويل (1000 = 3 خانات عشرية)
    PRECISION: 1000,
    
    /**
     * تحويل الرقم إلى عدد صحيح للحساب الداخلي
     * @param {number|string} value - القيمة المراد تحويلها
     * @returns {number} - القيمة كعدد صحيح
     */
    toInt(value) {
        if (value === null || value === undefined || value === '') return 0;
        // تحويل إلى رقم ثم ضرب في 1000 وتقريب
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 0;
        return Math.round(num * this.PRECISION);
    },
    
    /**
     * تحويل من العدد الصحيح الداخلي إلى رقم عشري
     * @param {number} intValue - العدد الصحيح الداخلي
     * @returns {number} - القيمة العشرية
     */
    toDecimal(intValue) {
        return intValue / this.PRECISION;
    },
    
    /**
     * تنسيق الرقم للعرض (3 خانات عشرية)
     * @param {number} value - القيمة (عشرية أو صحيحة داخلية)
     * @param {boolean} isInt - هل القيمة عدد صحيح داخلي؟
     * @returns {string} - الرقم منسق
     */
    format(value, isInt = false) {
        const decimal = isInt ? this.toDecimal(value) : value;
        return decimal.toFixed(3);
    },
    
    /**
     * جمع رقمين بدقة عالية
     * @param {number} a - الرقم الأول (عشري)
     * @param {number} b - الرقم الثاني (عشري)
     * @returns {number} - الناتج (عشري)
     */
    add(a, b) {
        const intA = this.toInt(a);
        const intB = this.toInt(b);
        return this.toDecimal(intA + intB);
    },
    
    /**
     * طرح رقمين بدقة عالية
     * @param {number} a - الرقم الأول (عشري)
     * @param {number} b - الرقم الثاني (عشري)
     * @returns {number} - الناتج (عشري)
     */
    subtract(a, b) {
        const intA = this.toInt(a);
        const intB = this.toInt(b);
        return this.toDecimal(intA - intB);
    },
    
    /**
     * ضرب رقمين بدقة عالية
     * @param {number} price - السعر (عشري)
     * @param {number} quantity - الكمية (عدد صحيح)
     * @returns {number} - الناتج (عشري)
     */
    multiply(price, quantity) {
        const intPrice = this.toInt(price);
        // الكمية عدد صحيح، لا نحولها
        const result = intPrice * Math.round(quantity);
        return this.toDecimal(result);
    },
    
    /**
     * حساب نسبة مئوية بدقة عالية
     * @param {number} amount - المبلغ (عشري)
     * @param {number} percent - النسبة المئوية
     * @returns {number} - الناتج (عشري)
     */
    percentage(amount, percent) {
        const intAmount = this.toInt(amount);
        // نسبة * المبلغ / 100
        const result = Math.round((intAmount * percent) / 100);
        return this.toDecimal(result);
    },
    
    /**
     * حساب إجمالي عناصر السلة بدقة عالية
     * @param {Array} items - عناصر السلة [{price, quantity}, ...]
     * @returns {number} - الإجمالي (عشري)
     */
    calculateSubtotal(items) {
        if (!items || items.length === 0) return 0;
        
        let totalInt = 0;
        for (const item of items) {
            const priceInt = this.toInt(item.price);
            const qty = Math.round(item.quantity || 1);
            totalInt += priceInt * qty;
        }
        
        return this.toDecimal(totalInt);
    },
    
    /**
     * حساب الخصم بدقة عالية
     * @param {number} subtotal - المجموع الفرعي (عشري)
     * @param {number} discountPercent - نسبة الخصم
     * @returns {object} - {discountAmount, total}
     */
    applyDiscount(subtotal, discountPercent) {
        if (!discountPercent || discountPercent <= 0) {
            return {
                discountAmount: 0,
                total: subtotal
            };
        }
        
        const subtotalInt = this.toInt(subtotal);
        const discountInt = Math.round((subtotalInt * discountPercent) / 100);
        const totalInt = subtotalInt - discountInt;
        
        return {
            discountAmount: this.toDecimal(discountInt),
            total: this.toDecimal(totalInt)
        };
    },
    
    /**
     * حساب كامل للطلب بدقة عالية
     * @param {Array} items - عناصر السلة
     * @param {number} discountPercent - نسبة الخصم (اختياري)
     * @param {number} taxPercent - نسبة الضريبة (اختياري)
     * @returns {object} - {subtotal, discountAmount, taxAmount, total}
     */
    calculateOrder(items, discountPercent = 0, taxPercent = 0) {
        // المجموع الفرعي
        const subtotal = this.calculateSubtotal(items);
        const subtotalInt = this.toInt(subtotal);
        
        // الخصم
        const discountInt = discountPercent > 0 
            ? Math.round((subtotalInt * discountPercent) / 100) 
            : 0;
        
        // المبلغ بعد الخصم
        const afterDiscountInt = subtotalInt - discountInt;
        
        // الضريبة (على المبلغ بعد الخصم)
        const taxInt = taxPercent > 0 
            ? Math.round((afterDiscountInt * taxPercent) / 100) 
            : 0;
        
        // الإجمالي النهائي
        const totalInt = afterDiscountInt + taxInt;
        
        return {
            subtotal: this.toDecimal(subtotalInt),
            discountAmount: this.toDecimal(discountInt),
            taxAmount: this.toDecimal(taxInt),
            total: this.toDecimal(totalInt),
            // للتحقق الداخلي
            _intValues: {
                subtotal: subtotalInt,
                discount: discountInt,
                tax: taxInt,
                total: totalInt
            }
        };
    },
    
    /**
     * حساب سعر العنصر × الكمية
     * @param {number} price - السعر
     * @param {number} quantity - الكمية
     * @returns {string} - السعر منسق
     */
    itemTotal(price, quantity) {
        return this.format(this.multiply(price, quantity));
    },
    
    /**
     * مقارنة رقمين بدقة
     * @param {number} a - الرقم الأول
     * @param {number} b - الرقم الثاني
     * @returns {boolean} - هل هما متساويان؟
     */
    equals(a, b) {
        return this.toInt(a) === this.toInt(b);
    },
    
    /**
     * التحقق من أن الرقم أكبر من صفر
     * @param {number} value - القيمة
     * @returns {boolean}
     */
    isPositive(value) {
        return this.toInt(value) > 0;
    },
    
    /**
     * تقريب الرقم لأقرب 3 خانات عشرية
     * @param {number} value - القيمة
     * @returns {number}
     */
    round(value) {
        return this.toDecimal(this.toInt(value));
    }
};

// للتوافق مع الكود القديم
const PC = PrecisionCalc;

// تصدير للاستخدام في Node.js (اختياري)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrecisionCalc;
}

console.log('✅ نظام الحساب الدقيق جاهز - PrecisionCalc');


