import 'package:flutter/material.dart';
import '../../../models/cart_model.dart';
import '../../../models/order_model.dart';

/// Payment panel widget for POS
class PaymentPanel extends StatefulWidget {

  const PaymentPanel({
    super.key,
    required this.cart,
    required this.isProcessing,
    required this.onProcessPayment,
  });
  final Cart cart;
  final bool isProcessing;
  final void Function(PaymentMethod method, double? amountReceived) onProcessPayment;

  @override
  State<PaymentPanel> createState() => _PaymentPanelState();
}

class _PaymentPanelState extends State<PaymentPanel> {
  PaymentMethod _selectedMethod = PaymentMethod.cash;
  final TextEditingController _amountController = TextEditingController();
  double _receivedAmount = 0;

  @override
  void initState() {
    super.initState();
    _amountController.addListener(_updateReceivedAmount);
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _updateReceivedAmount() {
    setState(() {
      _receivedAmount = double.tryParse(_amountController.text) ?? 0;
    });
  }

  double get _changeAmount {
    if (_selectedMethod != PaymentMethod.cash) return 0;
    return (_receivedAmount - widget.cart.grandTotal).clamp(0, double.infinity);
  }

  void _addAmount(double amount) {
    final current = double.tryParse(_amountController.text) ?? 0;
    _amountController.text = (current + amount).toStringAsFixed(0);
  }

  void _setExactAmount() {
    _amountController.text = widget.cart.grandTotal.toStringAsFixed(0);
  }

  void _clearAmount() {
    _amountController.clear();
  }

  void _processPayment() {
    if (widget.cart.isEmpty) return;
    
    if (_selectedMethod == PaymentMethod.cash && _receivedAmount < widget.cart.grandTotal) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('المبلغ المستلم أقل من الإجمالي', textAlign: TextAlign.right),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    widget.onProcessPayment(
      _selectedMethod,
      _selectedMethod == PaymentMethod.cash ? _receivedAmount : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        _buildHeader(),
        
        // Payment method selector
        _buildPaymentMethodSelector(),
        
        // Amount display
        _buildAmountDisplay(),
        
        // Numpad (for cash)
        if (_selectedMethod == PaymentMethod.cash)
          Expanded(child: _buildNumpad()),
        
        // Card payment info
        if (_selectedMethod == PaymentMethod.card)
          Expanded(child: _buildCardPaymentInfo()),
        
        // Pay button
        _buildPayButton(),
      ],
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const Text(
            'الدفع',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          // Total display
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
            decoration: BoxDecoration(
              color: const Color(0xFF334155),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text(
                  'الإجمالي',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${widget.cart.grandTotal.toStringAsFixed(2)} ر.س',
                  style: const TextStyle(
                    color: Color(0xFFD4A574),
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          _PaymentMethodButton(
            label: 'نقداً',
            icon: Icons.payments_outlined,
            isSelected: _selectedMethod == PaymentMethod.cash,
            onTap: () => setState(() => _selectedMethod = PaymentMethod.cash),
          ),
          const SizedBox(width: 12),
          _PaymentMethodButton(
            label: 'بطاقة',
            icon: Icons.credit_card,
            isSelected: _selectedMethod == PaymentMethod.card,
            onTap: () => setState(() => _selectedMethod = PaymentMethod.card),
          ),
        ],
      ),
    );
  }

  Widget _buildAmountDisplay() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF334155),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          if (_selectedMethod == PaymentMethod.cash) ...[
            // Received amount
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'المبلغ المستلم',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 14,
                  ),
                ),
                Text(
                  '${_receivedAmount.toStringAsFixed(2)} ر.س',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(color: Color(0xFF475569), height: 24),
            // Change
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'الباقي',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 14,
                  ),
                ),
                Text(
                  '${_changeAmount.toStringAsFixed(2)} ر.س',
                  style: TextStyle(
                    color: _changeAmount > 0 ? Colors.green : Colors.grey.shade400,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ] else ...[
            // Card payment
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.credit_card, color: Colors.grey.shade400, size: 24),
                const SizedBox(width: 12),
                Text(
                  'الدفع بالبطاقة',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNumpad() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Quick amounts
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: [
                _QuickAmountButton(
                  label: 'مطابق',
                  onTap: _setExactAmount,
                  isPrimary: true,
                ),
                const SizedBox(width: 8),
                _QuickAmountButton(label: '+50', onTap: () => _addAmount(50)),
                const SizedBox(width: 8),
                _QuickAmountButton(label: '+100', onTap: () => _addAmount(100)),
              ],
            ),
          ),
          
          // Numpad grid
          Expanded(
            child: GridView.count(
              crossAxisCount: 3,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 1.5,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _NumpadButton(label: '7', onTap: () => _appendDigit('7')),
                _NumpadButton(label: '8', onTap: () => _appendDigit('8')),
                _NumpadButton(label: '9', onTap: () => _appendDigit('9')),
                _NumpadButton(label: '4', onTap: () => _appendDigit('4')),
                _NumpadButton(label: '5', onTap: () => _appendDigit('5')),
                _NumpadButton(label: '6', onTap: () => _appendDigit('6')),
                _NumpadButton(label: '1', onTap: () => _appendDigit('1')),
                _NumpadButton(label: '2', onTap: () => _appendDigit('2')),
                _NumpadButton(label: '3', onTap: () => _appendDigit('3')),
                _NumpadButton(
                  label: 'C',
                  onTap: _clearAmount,
                  backgroundColor: const Color(0xFFEF4444),
                ),
                _NumpadButton(label: '0', onTap: () => _appendDigit('0')),
                _NumpadButton(
                  icon: Icons.backspace_outlined,
                  onTap: _backspace,
                  backgroundColor: const Color(0xFF64748B),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _appendDigit(String digit) {
    _amountController.text = _amountController.text + digit;
  }

  void _backspace() {
    final text = _amountController.text;
    if (text.isNotEmpty) {
      _amountController.text = text.substring(0, text.length - 1);
    }
  }

  Widget _buildCardPaymentInfo() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF334155),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.contactless,
              size: 64,
              color: Color(0xFF3B82F6),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'جاهز للدفع بالبطاقة',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'اضغط على زر الدفع للمتابعة',
            style: TextStyle(
              color: Colors.grey.shade500,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPayButton() {
    final canPay = !widget.cart.isEmpty && 
        (_selectedMethod != PaymentMethod.cash || _receivedAmount >= widget.cart.grandTotal);
    
    return Container(
      padding: const EdgeInsets.all(20),
      child: SizedBox(
        width: double.infinity,
        height: 64,
        child: ElevatedButton(
          onPressed: canPay && !widget.isProcessing ? _processPayment : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: canPay ? const Color(0xFF22C55E) : const Color(0xFF64748B),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: canPay ? 4 : 0,
          ),
          child: widget.isProcessing
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle, size: 28),
                    const SizedBox(width: 12),
                    const Text(
                      'تأكيد الدفع',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '(F12)',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

class _PaymentMethodButton extends StatelessWidget {

  const _PaymentMethodButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: isSelected
                  ? const Color(0xFFD4A574)
                  : const Color(0xFF334155),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? const Color(0xFFD4A574)
                    : const Color(0xFF475569),
                width: 2,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  icon,
                  size: 28,
                  color: isSelected ? Colors.white : Colors.grey.shade400,
                ),
                const SizedBox(height: 8),
                Text(
                  label,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey.shade400,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QuickAmountButton extends StatelessWidget {

  const _QuickAmountButton({
    required this.label,
    required this.onTap,
    this.isPrimary = false,
  });
  final String label;
  final VoidCallback onTap;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: isPrimary
                  ? const Color(0xFF3B82F6)
                  : const Color(0xFF475569),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}

class _NumpadButton extends StatelessWidget {

  const _NumpadButton({
    this.label,
    this.icon,
    required this.onTap,
    this.backgroundColor,
  });
  final String? label;
  final IconData? icon;
  final VoidCallback onTap;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            color: backgroundColor ?? const Color(0xFF475569),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: icon != null
                ? Icon(icon, color: Colors.white, size: 24)
                : Text(
                    label ?? '',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}



