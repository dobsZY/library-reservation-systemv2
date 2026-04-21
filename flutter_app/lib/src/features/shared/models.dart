class AppUser {
  AppUser({
    required this.id,
    required this.studentNumber,
    required this.fullName,
    required this.role,
  });

  final String id;
  final String studentNumber;
  final String fullName;
  final String role;

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'].toString(),
        studentNumber: json['studentNumber']?.toString() ?? '',
        fullName: json['fullName']?.toString() ?? '',
        role: json['role']?.toString() ?? 'student',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'studentNumber': studentNumber,
        'fullName': fullName,
        'role': role,
      };
}

class Reservation {
  Reservation({
    required this.id,
    required this.status,
    this.startTime,
    this.endTime,
  });

  final String id;
  final String status;
  final String? startTime;
  final String? endTime;

  factory Reservation.fromJson(Map<String, dynamic> json) => Reservation(
        id: json['id'].toString(),
        status: json['status']?.toString() ?? 'reserved',
        startTime: json['startTime']?.toString(),
        endTime: json['endTime']?.toString(),
      );
}

class Hall {
  Hall({
    required this.id,
    required this.name,
    required this.floor,
    this.occupancyRate,
    this.availableTables,
  });

  final String id;
  final String name;
  final int floor;
  final double? occupancyRate;
  final int? availableTables;

  factory Hall.fromJson(Map<String, dynamic> json) => Hall(
        id: json['id'].toString(),
        name: json['name']?.toString() ?? '',
        floor: (json['floor'] as num?)?.toInt() ?? 0,
        occupancyRate: (json['occupancyRate'] as num?)?.toDouble(),
        availableTables: (json['availableTables'] as num?)?.toInt(),
      );
}
