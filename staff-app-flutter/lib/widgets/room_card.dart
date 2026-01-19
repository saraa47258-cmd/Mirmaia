import 'package:flutter/material.dart';
import 'dart:async';
import '../models/room_model.dart';
import '../services/realtime_database_service.dart';

class RoomCard extends StatefulWidget {

  const RoomCard({
    super.key,
    required this.room,
    required this.onTap,
  });
  final RoomModel room;
  final VoidCallback onTap;

  @override
  State<RoomCard> createState() => _RoomCardState();
}

class _RoomCardState extends State<RoomCard> {
  final RealtimeDatabaseService _rtdb = RealtimeDatabaseService();
  double? _roomCharge;
  String? _gender;
  StreamSubscription? _reservationSubscription;
  StreamSubscription? _orderSubscription;

  @override
  void initState() {
    super.initState();
    _loadReservationData();
  }

  @override
  void didUpdateWidget(RoomCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.room.activeReservationId != oldWidget.room.activeReservationId ||
        widget.room.activeOrderId != oldWidget.room.activeOrderId) {
      _reservationSubscription?.cancel();
      _orderSubscription?.cancel();
      _loadReservationData();
    }
  }

  void _loadReservationData() async {
    if (widget.room.activeReservationId != null) {
      final reservation = await _rtdb.getRoomReservation(widget.room.activeReservationId!);
      if (mounted && reservation != null) {
        setState(() {
          _roomCharge = reservation.roomCharge;
          _gender = reservation.gender;
        });
        _listenToReservation();
      }
    } else if (widget.room.activeOrderId != null) {
      // Try to get order and extract room charge
      final order = await _rtdb.getOrderById(widget.room.activeOrderId!);
      if (mounted && order != null) {
        // Check if order has roomCharge or gender info
        final roomCharge = (order['roomCharge'] as num?)?.toDouble();
        final gender = order['gender']?.toString();
        if (roomCharge != null) {
          setState(() {
            _roomCharge = roomCharge;
            _gender = gender;
          });
        }
        _listenToOrder();
      }
    } else {
      setState(() {
        _roomCharge = null;
        _gender = null;
      });
    }
  }

  void _listenToReservation() {
    if (widget.room.activeReservationId == null) return;

    _reservationSubscription = _rtdb
        .listenToRoomReservation(widget.room.activeReservationId!)
        .listen((reservation) {
      if (mounted && reservation != null) {
        setState(() {
          _roomCharge = reservation.roomCharge;
          _gender = reservation.gender;
        });
      }
    });
  }

  void _listenToOrder() {
    if (widget.room.activeOrderId == null) return;

    _orderSubscription = _rtdb.listenToOrder(widget.room.activeOrderId!).listen((order) {
      if (mounted && order != null) {
        final roomCharge = (order['roomCharge'] as num?)?.toDouble();
        final gender = order['gender']?.toString();
        if (roomCharge != null) {
          setState(() {
            _roomCharge = roomCharge;
            _gender = gender;
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _reservationSubscription?.cancel();
    _orderSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isActive = widget.room.isActiveRoom;
    final statusColor = isActive ? const Color(0xFFDC2626) : const Color(0xFF22C55E);

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFFEE2E2) : const Color(0xFFDCFCE7),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: statusColor,
            width: 1.5,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row: Status and Gender
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getStatusLabel(widget.room.status),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: statusColor,
                      ),
                    ),
                  ),
                  // Gender badge (if active)
                  if (isActive && _gender != null)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _gender!.toLowerCase() == 'boy' ? Icons.person : Icons.person_outline,
                          size: 10,
                          color: const Color(0xFF475569),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          _gender!.toLowerCase() == 'boy' ? 'ولد' : 'بنت',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                ],
              ),

              const SizedBox(height: 6),

              // Room number (compact)
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isActive ? statusColor : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Center(
                      child: Text(
                        widget.room.roomNumber,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: isActive ? Colors.white : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      widget.room.displayName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),

              // Room charge (if active) - compact
              if (isActive && _roomCharge != null) ...[
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _roomCharge!.toStringAsFixed(3),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: statusColor,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Text(
                        'ر.ع',
                        style: TextStyle(
                          fontSize: 9,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ] else if (isActive) ...[
                const SizedBox(height: 4),
                const SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(strokeWidth: 1.5),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'reserved':
        return 'محجوزة';
      case 'occupied':
        return 'مشغولة';
      default:
        return status;
    }
  }
}



