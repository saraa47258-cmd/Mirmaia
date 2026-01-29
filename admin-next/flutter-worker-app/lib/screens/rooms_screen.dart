import 'package:flutter/material.dart';
import '../services/firebase_service.dart';

class RoomsScreen extends StatefulWidget {
  const RoomsScreen({super.key});

  @override
  State<RoomsScreen> createState() => _RoomsScreenState();
}

class _RoomsScreenState extends State<RoomsScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  List<Map<String, dynamic>> _rooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRooms();
  }

  Future<void> _loadRooms() async {
    setState(() => _isLoading = true);
    final rooms = await _firebaseService.getRooms();
    setState(() {
      _rooms = rooms;
      _isLoading = false;
    });
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'available':
        return Colors.green;
      case 'occupied':
        return Colors.red;
      case 'reserved':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'occupied':
        return 'مشغولة';
      case 'reserved':
        return 'محجوزة';
      default:
        return 'غير معروف';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_rooms.isEmpty) {
      return const Center(
        child: Text('لا توجد غرف'),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _rooms.length,
      itemBuilder: (context, index) {
        final room = _rooms[index];
        final status = room['status']?.toString() ?? 'available';
        final name = room['name'] ?? 'غرفة ${index + 1}';
        final capacity = room['capacity'] ?? 0;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getStatusColor(status).withOpacity(0.2),
              child: Icon(
                Icons.meeting_room,
                color: _getStatusColor(status),
              ),
            ),
            title: Text(
              name,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text('سعة: $capacity أشخاص'),
            trailing: Chip(
              label: Text(_getStatusText(status)),
              backgroundColor: _getStatusColor(status).withOpacity(0.2),
              labelStyle: TextStyle(color: _getStatusColor(status)),
            ),
            onTap: () {
              // Show room details
            },
          ),
        );
      },
    );
  }
}
