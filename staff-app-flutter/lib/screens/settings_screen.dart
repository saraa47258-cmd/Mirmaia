import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../layouts/app_shell.dart';
import '../providers/auth_provider.dart';

/// Settings screen
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return AppShell(
      currentRoute: '/settings',
      pageTitle: 'الإعدادات',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile section
            _SettingsSection(
              title: 'الملف الشخصي',
              children: [
                _SettingsTile(
                  icon: Icons.person_outline_rounded,
                  title: 'الاسم',
                  subtitle: user?.fullName ?? 'غير محدد',
                ),
                _SettingsTile(
                  icon: Icons.badge_outlined,
                  title: 'الدور',
                  subtitle: user?.role ?? 'موظف',
                ),
                _SettingsTile(
                  icon: Icons.alternate_email_rounded,
                  title: 'اسم المستخدم',
                  subtitle: user?.username ?? 'غير محدد',
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Preferences section
            _SettingsSection(
              title: 'التفضيلات',
              children: [
                const _SettingsTile(
                  icon: Icons.language_rounded,
                  title: 'اللغة',
                  subtitle: 'العربية',
                  trailing: Icon(Icons.chevron_left, color: Colors.grey),
                ),
                _SettingsTile(
                  icon: Icons.dark_mode_outlined,
                  title: 'الوضع الداكن',
                  subtitle: 'مغلق',
                  trailing: Switch(
                    value: false,
                    onChanged: (value) {},
                    activeThumbColor: const Color(0xFF6366F1),
                  ),
                ),
                _SettingsTile(
                  icon: Icons.notifications_none_rounded,
                  title: 'الإشعارات',
                  subtitle: 'مفعّل',
                  trailing: Switch(
                    value: true,
                    onChanged: (value) {},
                    activeThumbColor: const Color(0xFF6366F1),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // About section
            const _SettingsSection(
              title: 'حول التطبيق',
              children: [
                _SettingsTile(
                  icon: Icons.info_outline_rounded,
                  title: 'الإصدار',
                  subtitle: '1.0.0',
                ),
                _SettingsTile(
                  icon: Icons.update_rounded,
                  title: 'تحديثات',
                  subtitle: 'التطبيق محدّث',
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Logout button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await authProvider.logout();
                  Navigator.pushReplacementNamed(context, '/login');
                },
                icon: const Icon(Icons.logout_rounded),
                label: const Text('تسجيل الخروج'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {

  const _SettingsSection({
    required this.title,
    required this.children,
  });
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF64748B),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              for (int i = 0; i < children.length; i++) ...[
                children[i],
                if (i < children.length - 1)
                  Divider(height: 1, color: Colors.grey.shade200),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatefulWidget {

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  State<_SettingsTile> createState() => _SettingsTileState();
}

class _SettingsTileState extends State<_SettingsTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          child: Container(
            padding: const EdgeInsets.all(16),
            color: _isHovered ? const Color(0xFFF8FAFC) : Colors.transparent,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    widget.icon,
                    size: 20,
                    color: const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: Color(0xFF1A1D21),
                        ),
                      ),
                      Text(
                        widget.subtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.trailing != null) widget.trailing!,
              ],
            ),
          ),
        ),
      ),
    );
  }
}



